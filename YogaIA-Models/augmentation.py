import os
from PIL import Image
import numpy as np
import cv2
from tensorflow.keras.utils import load_img
from tensorflow.keras.utils import img_to_array
from keras.preprocessing.image import ImageDataGenerator


def image_generate(path_input, path_out='image_generate', num_image=5):
    """
    Toma una imagen, le aplica una serie de transformaciones aleatorias y guarda la imagen transformada
    a un nuevo archivo

    @param path_input La ruta a la carpeta que contiene las imágenes que desea aumentar.
    @param path_out La ruta a la carpeta donde desea guardar las imágenes generadas.
    @param num_image número de imágenes a generar
    """
    train_data_gen = ImageDataGenerator(
        # rotation_range=20,
        zoom_range=0.1,
        width_shift_range=0.05,
        height_shift_range=0.05,
        horizontal_flip=True,
        vertical_flip=False)

    content = os.listdir(path_input)
    i = 0
    num_img = 0
    for image_file in content:
        img_path = os.path.join(path_input, image_file)
        image = load_img(img_path)
        img = Image.open(img_path)

        width_shape, height_shape = img.size

        image = cv2.resize(img_to_array(image), (width_shape,
                                                 height_shape), interpolation=cv2.INTER_AREA)
        x = image/255
        x = np.expand_dims(x, axis=0)
        t = 1
        for output_batch in train_data_gen.flow(x, batch_size=1):
            a = img_to_array(output_batch[0])
            imagen = output_batch[0, :, :]*255
            image_final = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB)
            path_final = os.path.join(path_out, "%i%i-aug.jpg" % (i, t))
            # print(path_final)
            cv2.imwrite(path_final, image_final)
            t += 1

            num_img += 1
            if t > num_image:
                break
        i += 1
    return num_img


if __name__ == '__main__':

    route_root = os.getcwd()
    data_path = os.path.join(route_root, 'img')
    data_dir_list = os.listdir(data_path)
    total_image = 0
    for pose_class_name in data_dir_list:
        print(pose_class_name)
        # ruta para las clases de pose
        try:
            os.makedirs('dataset_augmentation/'+pose_class_name)
        except:
            print("")
        images_in_folder = os.path.join(data_path, pose_class_name)
        cant_image = image_generate(images_in_folder, os.path.join(
            route_root, 'dataset_augmentation', pose_class_name), 2)
        total_image += cant_image

        print('image augmentation de ' + pose_class_name +
              ' %i de imagenes generadas 👻👌' % cant_image)
    print('Imagenes en total generadas para el data_augmentation %i' % total_image)
