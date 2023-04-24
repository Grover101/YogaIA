import math
import os
import shutil
import sys


def creacion_dataset(path_images='img'):
    try:
        route_root = os.getcwd()
        route_dataset = os.path.join(route_root, 'dataset')
        images_in_folder_root = os.path.join(route_root, path_images)
        if ('dataset' not in os.listdir()):
            os.makedirs('dataset')
        # Obtener las clases de las poses
        folder_class = sorted(
            [n for n in os.listdir(images_in_folder_root)]
        )

        for pose_class_name in folder_class:
            # ruta para las clases de pose
            images_in_folder = os.path.join(
                images_in_folder_root, pose_class_name)

            # Numero de imagenes por clase
            list_image = os.listdir(images_in_folder)
            num_image = len(list_image)
            # print(pose_class_name, num_image)

            # 80% de las imagenes para entrenaminto
            train_image = math.trunc(num_image * 0.8)
            # print('train', pose_class_name, train_image)
            print('Reparticion de imagenes ' + pose_class_name + ' train')
            # Creando el dataset para train y test
            route = os.path.join(route_dataset, 'train', pose_class_name)
            os.makedirs(route, exist_ok=True)
            for index, image in enumerate(list_image):
                if train_image == index+1:
                    print('Reparticion de imagenes ' +
                          pose_class_name + ' test')
                    route = os.path.join(
                        route_dataset, 'test', pose_class_name)
                    os.makedirs(route, exist_ok=True)
                src = os.path.join(images_in_folder, image)  # origen
                dst = os.path.join(route, image)  # destino
                shutil.copyfile(src, dst)

        print('Dataset creado 👻👌')
    except:
        print('Ocurrio un problema al crear el dataset')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'augmentation':
        creacion_dataset('dataset_augmentation')
    else:
        creacion_dataset()
