import os
import cv2
from rembg import remove
import numpy as np
import shutil


def get_bbox(img_path: str) -> tuple[int, int, int, int, int, int]:
    print(img_path)
    input_data = cv2.imread(img_path)
    mask = remove(input_data, only_mask=True, alpha_matting=True)
    x, y, w, h = cv2.boundingRect(mask)
    x1, y1, x2, y2 = x, y, x + w, y + h
    output_img = cv2.rectangle(input_data, (x1, y1), (x2, y2), color = (255, 0, 0), thickness=2)
    print(input_data.shape)
    size_y, size_x = input_data.shape[:-1]
    return x + w/2, y + h/2, w, h, size_x, size_y, output_img


data = []

for class_id, dir in enumerate([i for i in os.walk('./data/')][0][1]):
    for file in [i for i in os.walk(f'./data/{dir}')][0][2]:
        data.append((class_id, os.path.join("./data", dir, file)))

data = np.asarray(data)
np.random.shuffle(data)

train_length = len(data) * 4 // 5

train_X_path = data[:train_length]
val_X_path = data[train_length:]

os.mkdir("./dataset")

os.mkdir("./dataset/images")
os.mkdir("./dataset/images/train")
os.mkdir("./dataset/images/val")

os.mkdir("./dataset/labels")
os.mkdir("./dataset/labels/train")
os.mkdir("./dataset/labels/val")

os.mkdir('./trash')
os.mkdir('./trash/train')
os.mkdir('./trash/val')

for img_id, (class_id, path) in enumerate(train_X_path):
    x_center, y_center, width, height, size_x, size_y, output_img = get_bbox(path)
    shutil.copy(path, f"./dataset/images/train/img{img_id+1}.jpg")
    with open(f"./dataset/labels/train/img{img_id+1}.txt", "w") as file:
        file.write(f"{class_id} {x_center/size_x} {y_center/size_y} {width/size_x} {height/size_y}")
    cv2.imwrite(f"./trash/train/img{img_id + 1}.jpg", output_img)

for img_id, (class_id, path) in enumerate(val_X_path):
    x_center, y_center, width, height, size_x, size_y, output_img  = get_bbox(path)
    shutil.copy(path, f"./dataset/images/val/img{img_id+1}.jpg")
    with open(f"./dataset/labels/val/img{img_id+1}.txt", "w") as file:
        file.write(f"{class_id} {x_center/size_x} {y_center/size_y} {width/size_x} {height/size_y}")
    cv2.imwrite(f"./trash/val/img{img_id + 1}.jpg", output_img)