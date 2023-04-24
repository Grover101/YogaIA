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
