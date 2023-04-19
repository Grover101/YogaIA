""" Base para la implementacion: 
- https://tfhub.dev/google/movenet/singlepose/lightning/4
- https://colab.research.google.com/github/tensorflow/hub/blob/master/examples/colab/movenet.ipynb
"""

import os
from typing import Dict, List
import cv2
from data import BodyPart
from data import Person
from data import person_from_keypoints_with_scores
import numpy as np

# error al importar Interpreter
try:
    from tflite_runtime.interpreter import Interpreter
except ImportError:
    import tensorflow as tf
    Interpreter = tf.lite.Interpreter


class Movenet(object):
    """Clase de estimacion de pose con MoveNet TFLite"""

    _MIN_CROP_KEYPOINT_SCORE = 0.2
    _TORSO_EXPANSION_RATIO = 1.9
    _BODY_EXPANSION_RATIO = 1.2

    def __init__(self, model_name: str) -> None:
        """Inicializacion el modelo MOveNet

        Args:
          model_name: Nombre del modelo TFLite MoveNet.
        """
        # Carga de modelo MoveNet
        _, ext = os.path.splitext(model_name)
        if not ext:
            model_name += '.tflite'

        # Inicialiacion de modelo
        interpreter = Interpreter(model_path=model_name, num_threads=4)
        interpreter.allocate_tensors()

        self._input_index = interpreter.get_input_details()[0]['index']
        self._output_index = interpreter.get_output_details()[0]['index']

        self._input_height = interpreter.get_input_details()[0]['shape'][1]
        self._input_width = interpreter.get_input_details()[0]['shape'][2]

        self._interpreter = interpreter
        self._crop_region = None

    def init_crop_region(self, image_height: int,
                         image_width: int) -> Dict[(str, float)]:
        """Define la region de corte

        La función proporciona la región de recorte inicial (rellena la imagen completa de ambos lados para que sea una imagen cuadrada) cuando el algoritmo no puede determine la región de recorte del cuadro anterior.

        Args:
          image_height (int): Ancho de la imagen de entrada
          image_width (int): Alto de la imagen de entrada

        Returns:
          crop_region (dict): Regin de recorte preterminado
        """
        if image_width > image_height:
            x_min = 0.0
            box_width = 1.0
            y_min = (image_height / 2 - image_width / 2) / image_height
            box_height = image_width / image_height
        else:
            y_min = 0.0
            box_height = 1.0
            x_min = (image_width / 2 - image_height / 2) / image_width
            box_width = image_height / image_width

        return {
            'y_min': y_min,
            'x_min': x_min,
            'y_max': y_min + box_height,
            'x_max': x_min + box_width,
            'height': box_height,
            'width': box_width
        }

    def _torso_visible(self, keypoints: np.ndarray) -> bool:
        """Comprueba si hay suficientes puntos clave del torso.

        Esta funcion comprueba si el modelo confia en predecir uno de los hombros/caderas que se requiere para determinar una buena region de cultivo.

        Args:
          keypoints: Resultado de la deteccion del modelo Movenet.

        Returns:
          True/False
        """
        left_hip_score = keypoints[BodyPart.LEFT_HIP.value, 2]
        right_hip_score = keypoints[BodyPart.RIGHT_HIP.value, 2]
        left_shoulder_score = keypoints[BodyPart.LEFT_SHOULDER.value, 2]
        right_shoulder_score = keypoints[BodyPart.RIGHT_SHOULDER.value, 2]

        left_hip_visible = left_hip_score > Movenet._MIN_CROP_KEYPOINT_SCORE
        right_hip_visible = right_hip_score > Movenet._MIN_CROP_KEYPOINT_SCORE
        left_shoulder_visible = left_shoulder_score > Movenet._MIN_CROP_KEYPOINT_SCORE
        right_shoulder_visible = right_shoulder_score > Movenet._MIN_CROP_KEYPOINT_SCORE

        return ((left_hip_visible or right_hip_visible) and
                (left_shoulder_visible or right_shoulder_visible))

    def _determine_torso_y_rango_cuerpo(self, keypoints: np.ndarray,
                                        target_keypoints: Dict[(str, float)],
                                        center_y: float,
                                        center_x: float) -> List[float]:
        """Calcula la distancia máxima desde cada punto clave hasta el centro.

        La funcion devuelve las distancias maximas desde los dos conjuntos de puntos clave: 17 puntos clave completos y 4 puntos clave de torso. La informacion devuelta sera utilizarse para determinar el tamaño del cultivo. Ver _determina_region_corte para más detalles.

        Args:
          keypoints: Resultado de la deteccion del modelo Movenet.
          target_keypoints: Los 4 puntos del torso.
          center_y (float): Coordenadas verticales del centro del cuerpo.
          center_x (float): Coordenadas horizontales del centro del cuerpo.

        Returns:
          La distancia maxima desde cada punto clave hasta la ubicacion central.
        """
        torso_joints = [
            BodyPart.LEFT_SHOULDER, BodyPart.RIGHT_SHOULDER, BodyPart.LEFT_HIP,
            BodyPart.RIGHT_HIP
        ]
        max_torso_yrange = 0.0
        max_torso_xrange = 0.0
        for joint in torso_joints:
            dist_y = abs(center_y - target_keypoints[joint][0])
            dist_x = abs(center_x - target_keypoints[joint][1])
            if dist_y > max_torso_yrange:
                max_torso_yrange = dist_y
            if dist_x > max_torso_xrange:
                max_torso_xrange = dist_x

        max_body_yrange = 0.0
        max_body_xrange = 0.0
        for idx in range(len(BodyPart)):
            if keypoints[BodyPart(idx).value, 2] < Movenet._MIN_CROP_KEYPOINT_SCORE:
                continue
            dist_y = abs(center_y - target_keypoints[joint][0])
            dist_x = abs(center_x - target_keypoints[joint][1])
            if dist_y > max_body_yrange:
                max_body_yrange = dist_y

            if dist_x > max_body_xrange:
                max_body_xrange = dist_x

        return [
            max_torso_yrange, max_torso_xrange, max_body_yrange, max_body_xrange
        ]

    def _determina_region_corte(self, keypoints: np.ndarray, image_height: int,
                                image_width: int) -> Dict[(str, float)]:
        """Determina la region para recortar la imagen para que el modelo ejecute la inferencia.

        El algoritmo utiliza las articulaciones detectadas del cuadro anterior para estimar la región cuadrada que encierra todo el cuerpo de la persona objetivo y se centra en el punto medio de dos articulaciones de la cadera. El tamaño del cultivo está determinado por las distancias entre cada junta y el punto central. Cuando el modelo no confía en las cuatro predicciones de las articulaciones del torso, la función devuelve un recorte predeterminado que es la imagen completa rellenada al cuadrado.

        Args:
          keypoints: Resultado de la deteccion del modelo Movenet.
          image_height (int): Ancho de la imagen de entrada.
          image_width (int): Alto de la imagen de entrada.

        Returns:
          crop_region (dict): La region de recorte en la que se ejecutara la inferencia.
        """
        target_keypoints = {}
        for idx in range(len(BodyPart)):
            target_keypoints[BodyPart(idx)] = [
                keypoints[idx, 0] *
                image_height, keypoints[idx, 1] * image_width
            ]

        # Calculo la region de recorte si el torso es visible.
        if self._torso_visible(keypoints):
            center_y = (target_keypoints[BodyPart.LEFT_HIP][0] +
                        target_keypoints[BodyPart.RIGHT_HIP][0]) / 2
            center_x = (target_keypoints[BodyPart.LEFT_HIP][1] +
                        target_keypoints[BodyPart.RIGHT_HIP][1]) / 2

            (max_torso_yrange, max_torso_xrange, max_body_yrange,
             max_body_xrange) = self._determine_torso_y_rango_cuerpo(
                 keypoints, target_keypoints, center_y, center_x)

            crop_length_half = np.amax([
                max_torso_xrange * Movenet._TORSO_EXPANSION_RATIO,
                max_torso_yrange * Movenet._TORSO_EXPANSION_RATIO,
                max_body_yrange * Movenet._BODY_EXPANSION_RATIO,
                max_body_xrange * Movenet._BODY_EXPANSION_RATIO
            ])

            # Ajuste la longitud del recorte para que aún este dentro del borde de la imagen
            distances_to_border = np.array(
                [center_x, image_width - center_x, center_y, image_height - center_y])
            crop_length_half = np.amin(
                [crop_length_half, np.amax(distances_to_border)])

            # Si el cuerpo es lo suficientemente grande, no es necesario aplicar la logica de recorte.
            if crop_length_half > max(image_width, image_height) / 2:
                return self.init_crop_region(image_height, image_width)
            # Calculo la region de recorte que cubre muy bien todo el cuerpo.
            else:
                crop_length = crop_length_half * 2
            crop_corner = [center_y - crop_length_half,
                           center_x - crop_length_half]
            return {
                'y_min': crop_corner[0] / image_height,
                'x_min': crop_corner[1] / image_width,
                'y_max': (crop_corner[0] + crop_length) / image_height,
                'x_max': (crop_corner[1] + crop_length) / image_width,
                'height': (crop_corner[0] + crop_length) / image_height - crop_corner[0] / image_height,
                'width': (crop_corner[1] + crop_length) / image_width - crop_corner[1] / image_width
            }
        # Devuelve la region de recorte inicial si el torso no esta visible.
        else:
            return self.init_crop_region(image_height, image_width)

    def _recorte_y_redimension(
            self, image: np.ndarray, crop_region: Dict[(str, float)],
            crop_size: (int, int)) -> np.ndarray:
        """Recorta y cambia el tamaño de la imagen para prepararla para la entrada del modelo."""
        y_min, x_min, y_max, x_max = [
            crop_region['y_min'], crop_region['x_min'], crop_region['y_max'],
            crop_region['x_max']
        ]

        crop_top = int(0 if y_min < 0 else y_min * image.shape[0])
        crop_bottom = int(image.shape[0] if y_max >=
                          1 else y_max * image.shape[0])
        crop_left = int(0 if x_min < 0 else x_min * image.shape[1])
        crop_right = int(image.shape[1] if x_max >=
                         1 else x_max * image.shape[1])

        padding_top = int(0 - y_min * image.shape[0] if y_min < 0 else 0)
        padding_bottom = int((y_max - 1) * image.shape[0] if y_max >= 1 else 0)
        padding_left = int(0 - x_min * image.shape[1] if x_min < 0 else 0)
        padding_right = int((x_max - 1) * image.shape[1] if x_max >= 1 else 0)

        # Recorta y cambia el tamaño de la imagen
        output_image = image[crop_top:crop_bottom, crop_left:crop_right]
        output_image = cv2.copyMakeBorder(output_image, padding_top, padding_bottom,
                                          padding_left, padding_right,
                                          cv2.BORDER_CONSTANT)
        output_image = cv2.resize(output_image, (crop_size[0], crop_size[1]))

        return output_image

    def _run_detector(
            self, image: np.ndarray, crop_region: Dict[(str, float)],
            crop_size: (int, int)) -> np.ndarray:
        """Ejecuta la inferencia del modelo en la region recortada.

        La funcion ejecuta la inferencia del modelo en la region recortada y actualiza la salida del modelo al sistema de coordenadas de la imagen original.

        Args:
          image: Imagen de entrada.
          crop_region: La region de interes para ejecutar la inferencia sobre.
          crop_size: El tamaño de la region de recorte.

        Returns:
          An array of shape [17, 3] representing the keypoint absolute coordinates
          and scores.
        """

        input_image = self._recorte_y_redimension(
            image, crop_region, crop_size=crop_size)
        input_image = input_image.astype(dtype=np.uint8)

        self._interpreter.set_tensor(self._input_index,
                                     np.expand_dims(input_image, axis=0))
        self._interpreter.invoke()

        keypoints_with_scores = self._interpreter.get_tensor(
            self._output_index)
        keypoints_with_scores = np.squeeze(keypoints_with_scores)

        # Acturalizacion de coordenadas
        for idx in range(len(BodyPart)):
            keypoints_with_scores[idx, 0] = crop_region[
                'y_min'] + crop_region['height'] * keypoints_with_scores[idx, 0]
            keypoints_with_scores[idx, 1] = crop_region[
                'x_min'] + crop_region['width'] * keypoints_with_scores[idx, 1]

        return keypoints_with_scores

    def detect(self,
               input_image: np.ndarray,
               reset_crop_region: bool = False) -> Person:
        """Ejecutar la deteccion en una imagen de entrada

        Args:
          input_image: Imagen RGB [alto, ancho, 3]. Tenga en cuenta que el alto y el ancho pueden ser cualquier cosa, ya que la imagen se redimensionara inmediatamente de acuerdo con las necesidades del modelo dentro de esta funcion.
          reset_crop_region: Si usar la region de recorte inferida del resultado de deteccion anterior para mejorar la precision. Establezcalo en verdadero si se trata de un cuadro de un video. Establezcalo en falso si se trata de una imagen estatica. El valor predeterminado es verdadero.

        Returns:
          Una matriz de forma [17, 3] que representa las coordenadas y puntuaciones del punto clave.
        """
        image_height, image_width, _ = input_image.shape
        if (self._crop_region is None) or reset_crop_region:
            # Establezca la region de recorte para el primer cuadro
            self._crop_region = self.init_crop_region(
                image_height, image_width)

        # Detecta pose utilizando la region de recorte inferida del resultado de deteccion en el cuadro anterior
        keypoint_with_scores = self._run_detector(
            input_image,
            self._crop_region,
            crop_size=(self._input_height, self._input_width))
        # Calcula la region de recorte para el siguiente cuadro
        self._crop_region = self._determina_region_corte(
            keypoint_with_scores, image_height, image_width)

        # Convierta los puntos clave con puntuaciones en un tipo de datos de persona
        return person_from_keypoints_with_scores(keypoint_with_scores, image_height, image_width)
