import os
from dataset_generator import SyntheticDatasetGenerator


image_paths = os.listdir("clean_images")
label_paths = os.listdir("clean_labels")

gen = SyntheticDatasetGenerator(
    image_paths=["clean_images/" + path for path in image_paths],
    label_paths=["clean_labels/" + path for path in label_paths],
    output_dir="synthetic_dataset_train",
    image_size=(3864, 5152),
    max_classes=2,
    max_objects_per_class=2,
    max_overlap=0.2
)

gen.generate(n_samples=20000)