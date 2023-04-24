import tensorflow as tf
import numpy as np
import pandas as pd
import os
from movenet import Movenet
import wget
import csv
import tqdm
from data import BodyPart

# Descarga de modelo movenet para la deteccion de postura de una persona
if ('movenet_thunder.tflite' not in os.listdir()):
    wget.download(
        'https://tfhub.dev/google/lite-model/movenet/singlepose/thunder/tflite/float16/4?lite-format=tflite', 'movenet_thunder.tflite')

movenet = Movenet('movenet_thunder')

# Deteccion de una imagen y retorna una tupla
def detect(input_tensor, inference_count=3):
    movenet.detect(input_tensor.numpy(), reset_crop_region=True)
    for _ in range(inference_count - 1):
        detection = movenet.detect(
            input_tensor.numpy(), reset_crop_region=False)
    return detection

# Esta clase procesa las poses de las diferentes imagenes con puntos claves en coordenadas(x y)
# Luego pasandolas a un archivo csv
class Preprocessor(object):
    def __init__(self, images_in_folder, csv_path, state=''):
        self._images_in_folder = images_in_folder
        self._csvs_out_path = csv_path
        self._csvs_out_folder_per_class = 'temp'
        self._message = []
        self._state = state

        if (self._csvs_out_folder_per_class not in os.listdir()):
            os.makedirs(self._csvs_out_folder_per_class)

        # obtner lista de clases de modelo
        self._pose_class_names = sorted(
            [n for n in os.listdir(images_in_folder)]
        )

    def process(self, detection_threshold=0.1):
        # Procesamiento de imagenes en una ruta
        for pose_class_name in self._pose_class_names:
            # ruta de clases por pose
            print('Procesando '+pose_class_name + ' ' + self._state)
            images_in_folder = os.path.join(
                self._images_in_folder, pose_class_name)
            csv_out_path = os.path.join(
                self._csvs_out_folder_per_class, pose_class_name + '.csv')
            # Deteccion de punto por imagen guardando en un csv
            with open(csv_out_path, 'w') as csv_out_file:
                csv_out_writer = csv.writer(
                    csv_out_file, delimiter=',', quoting=csv.QUOTE_MINIMAL)
                # Lista de imagenes ordenadas
                image_names = sorted([n for n in os.listdir(images_in_folder)])
                valid_image_count = 0
                # Detecta puntos de resferencia de pose por cada imagen
                for image_name in tqdm.tqdm(image_names):
                    image_path = os.path.join(images_in_folder, image_name)

                    try:
                        image = tf.io.read_file(image_path)
                        image = tf.io.decode_jpeg(image)
                    except:
                        self._message.append(
                            'Skipped ' + image_path + ' Imagen invalida')
                        continue

                    # Saltar imagenes que no son RGB
                    if image.shape[2] != 3:
                        self._message.append(
                            'Skipped ' + image_path + ' La imagen no esta en RGB')
                        continue

                    # Deteccion de puntos de la postura
                    person = detect(image)

                    # Guardar los puntos de referencia que estan encima del umbral
                    min_landmark_score = min(
                        [keypoint.score for keypoint in person.keypoints])
                    should_keep_image = min_landmark_score >= detection_threshold
                    if not should_keep_image:
                        self._message.append(
                            'Skipped ' + image_path + ' La puntuacion de puntos clave esta por debajo del umbral')
                        continue

                    valid_image_count += 1

                    # Obtenga puntos de referencia y escalelos al mismo tamaño que la imagen de entrada
                    pose_landmarks = np.array([[keypoint.coordinate.x, keypoint.coordinate.y, keypoint.score]
                                              for keypoint in person.keypoints], dtype=np.float32)

                    # Escribir las coordenadas del punto de referencia en sus archivos csv
                    coord = pose_landmarks.flatten().astype(np.str).tolist()
                    csv_out_writer.writerow([image_name] + coord)

        # Fusionando todos los csv para cada clase en un solo archivo csv
        all_landmarks_df = self.all_landmarks_as_dataframe()
        all_landmarks_df.to_csv(self._csvs_out_path, index=False)

    def all_landmarks_as_dataframe(self):
        total_df = None
        for index, class_name in enumerate(self._pose_class_names):
            csv_out_path = os.path.join(
                self._csvs_out_folder_per_class, class_name + '.csv')
            per_class_df = pd.read_csv(csv_out_path, header=None)

            # Agrega las etiquetas
            per_class_df['class_no'] = [index]*len(per_class_df)
            # per_class_df['class_name'] = [index]*len(per_class_df)
            # print([class_name]*len(per_class_df))
            per_class_df['class_name'] = [class_name]*len(per_class_df)

            # Sera de forma temporal las carpetas
            # Agregue el nombre de la carpeta a la primera columna del nombre del archivo
            per_class_df[per_class_df.columns[0]] = class_name + \
                '/' + per_class_df[per_class_df.columns[0]]

            if total_df is None:
                total_df = per_class_df
            else:
                total_df = pd.concat([total_df, per_class_df], axis=0)

        list_name = [[bodypart.name + '_x', bodypart.name + '_y',
                      bodypart.name + '_score'] for bodypart in BodyPart]

        # Encabezado de cada columna
        header_name = []
        for columns_name in list_name:
            header_name += columns_name
        header_name = ['filename'] + header_name
        header_map = {total_df.columns[i]: header_name[i]
                      for i in range(len(header_name))}

        total_df.rename(header_map, axis=1, inplace=True)

        return total_df


route_root = os.getcwd()
route_dataset = os.path.join(route_root, 'dataset')

# Procesamiento de dataos para train en un archivo .csv
images_in_folder = os.path.join(route_dataset, 'train')
# print(images_in_folder)
csv_path = 'train_data.csv'
train_preprocessor = Preprocessor(
    images_in_folder,
    csv_path,
    'train'
)
train_preprocessor.process()

# Procesamiento de dataos para test en un archivo .csv
images_in_folder = os.path.join(route_dataset, 'test')
csv_path = 'test_data.csv'
test_preprocessor = Preprocessor(
    images_in_folder,
    csv_path,
    'test'
)
test_preprocessor.process()
