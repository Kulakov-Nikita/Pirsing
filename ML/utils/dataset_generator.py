import os
import random
import cv2
import numpy as np

class SyntheticDatasetGenerator:
    def __init__(self, image_paths, label_paths, output_dir,
                 image_size=(512, 512),
                 max_classes=3,
                 max_objects_per_class=5,
                 max_overlap=0.2):

        self.image_paths = image_paths
        self.label_paths = label_paths
        self.output_dir = output_dir
        self.image_size = image_size
        self.max_classes = max_classes
        self.max_objects_per_class = max_objects_per_class
        self.max_overlap = max_overlap

        os.makedirs(os.path.join(output_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "labels"), exist_ok=True)

        self.dataset = self._load_dataset()

    def _load_dataset(self):
        dataset = []
        for img_path, lbl_path in zip(self.image_paths, self.label_paths):
            if not os.path.exists(lbl_path):
                continue
            with open(lbl_path, "r") as f:
                labels = [line.strip().split() for line in f.readlines()]
                # Формат: class_id, x_center, y_center, w, h (нормализованные)
                labels = [(int(l[0]), *map(float, l[1:])) for l in labels]
            dataset.append((img_path, labels))
        return dataset

    def _paste_object(self, base_img, obj_img, x, y):
        """Вставка объекта с учётом альфа-маски"""
        h, w = obj_img.shape[:2]
        roi = base_img[y:y+h, x:x+w]
        gray = cv2.cvtColor(obj_img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY)
        mask_inv = cv2.bitwise_not(mask)

        bg = cv2.bitwise_and(roi, roi, mask=mask_inv)
        fg = cv2.bitwise_and(obj_img, obj_img, mask=mask)
        combined = cv2.add(bg, fg)
        base_img[y:y+h, x:x+w] = combined
        return base_img

    def _iou(self, box1, box2):
        """IoU для проверки пересечений"""
        x1, y1, w1, h1 = box1
        x2, y2, w2, h2 = box2

        xa = max(x1, x2)
        ya = max(y1, y2)
        xb = min(x1 + w1, x2 + w2)
        yb = min(y1 + h1, y2 + h2)

        inter_area = max(0, xb - xa) * max(0, yb - ya)
        union_area = w1*h1 + w2*h2 - inter_area
        return inter_area / union_area if union_area > 0 else 0

    def generate(self, n_samples=100):
        for idx in range(n_samples):
            canvas = np.zeros((self.image_size[0], self.image_size[1], 3), dtype=np.uint8)
            chosen_classes = random.sample(self.dataset, 
                                           min(self.max_classes, len(self.dataset)))
            labels_out = []
            placed_boxes = []

            for img_path, labels in chosen_classes:
                num_objects = random.randint(1, self.max_objects_per_class)
                for _ in range(num_objects):
                    obj_img = cv2.imread(img_path)
                    h, w = obj_img.shape[:2]

                    scale = random.uniform(0.3, 0.7)
                    new_w, new_h = int(w*scale), int(h*scale)
                    obj_resized = cv2.resize(obj_img, (new_w, new_h))

                    for attempt in range(20):  # ограничим попытки по нахождению места
                        x = random.randint(0, self.image_size[1] - new_w)
                        y = random.randint(0, self.image_size[0] - new_h)
                        new_box = (x, y, new_w, new_h)

                        overlaps = [self._iou(new_box, b) for b in placed_boxes]
                        if all(o <= self.max_overlap for o in overlaps):
                            canvas = self._paste_object(canvas, obj_resized, x, y)

                            # YOLO-аннотация
                            x_center = (x + new_w/2) / self.image_size[1]
                            y_center = (y + new_h/2) / self.image_size[0]
                            w_norm = new_w / self.image_size[1]
                            h_norm = new_h / self.image_size[0]

                            labels_out.append(f"{labels[0][0]} {x_center:.6f} {y_center:.6f} {w_norm:.6f} {h_norm:.6f}")
                            placed_boxes.append(new_box)
                            break

            # Сохранение
            img_name = f"{idx:05d}.jpg"
            lbl_name = f"{idx:05d}.txt"
            cv2.imwrite(os.path.join(self.output_dir, "images", img_name), canvas)
            with open(os.path.join(self.output_dir, "labels", lbl_name), "w") as f:
                f.write("\n".join(labels_out))
