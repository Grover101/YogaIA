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
