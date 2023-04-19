import enum
import numpy as np
from typing import List, NamedTuple


class BodyPart(enum.Enum):
    """Enumeracion que representa puntos claves del cuerpo humano."""
    NOSE = 0
    LEFT_EYE = 1
    RIGHT_EYE = 2
    LEFT_EAR = 3
    RIGHT_EAR = 4
    LEFT_SHOULDER = 5
    RIGHT_SHOULDER = 6
    LEFT_ELBOW = 7
    RIGHT_ELBOW = 8
    LEFT_WRIST = 9
    RIGHT_WRIST = 10
    LEFT_HIP = 11
    RIGHT_HIP = 12
    LEFT_KNEE = 13
    RIGHT_KNEE = 14
    LEFT_ANKLE = 15
    RIGHT_ANKLE = 16


class Point(NamedTuple):
    """Punto en el espacio 2D"""
    x: float
    y: float


class Rectangle(NamedTuple):
    """Rectangulo en el espacio."""
    start_point: Point
    end_point: Point


class KeyPoint(NamedTuple):
    """Punto clave de un humano detectado"""
    body_part: BodyPart
    coordinate: Point
    score: float


class Person(NamedTuple):
    """Una pose detectada por un modelo de estimación de pose."""
    keypoints: List[KeyPoint]
    bounding_box: Rectangle
    score: float
    id: int = None


def person_from_keypoints_with_scores(
        keypoints_with_scores: np.ndarray,
        image_height: float,
        image_width: float,
        keypoint_score_threshold: float = 0.1) -> Person:
    """
    Crea una instancia de Persona a partir de la salida del modelo de estimación de una sola pose.

        Args:
            keypoints_with_scores: Salida del modelo de estimación de pose TFLite. Una matriz numpy con forma [17, 3]. Cada fila representa un punto clave: [y, x, puntuación].
            image_height: altura de la imagen en píxeles.
            image_width: ancho de la imagen en píxeles.
            keypoint_score_threshold: use solo puntos clave por encima de este umbral para calcular la puntuación media de la persona.

        Return:
            Una instancia de Persona.
    """

    kpts_x = keypoints_with_scores[:, 1]
    kpts_y = keypoints_with_scores[:, 0]
    scores = keypoints_with_scores[:, 2]

    # Convierta puntos clave al sistema de coordenadas de la imagen de entrada.
    keypoints = []
    for i in range(scores.shape[0]):
        keypoints.append(
            KeyPoint(
                BodyPart(i),
                Point(int(kpts_x[i] * image_width),
                      int(kpts_y[i] * image_height)),
                scores[i]))

    # Calcule el cuadro delimitador ya que los modelos SinglePose no devuelven el cuadro delimitador.
    start_point = Point(
        int(np.amin(kpts_x) * image_width), int(np.amin(kpts_y) * image_height))
    end_point = Point(
        int(np.amax(kpts_x) * image_width), int(np.amax(kpts_y) * image_height))
    bounding_box = Rectangle(start_point, end_point)

    # Calcule la puntuación de la persona promediando las puntuaciones de los puntos clave.
    scores_above_threshold = list(
        filter(lambda x: x > keypoint_score_threshold, scores))
    person_score = np.average(scores_above_threshold)

    return Person(keypoints, bounding_box, person_score)
