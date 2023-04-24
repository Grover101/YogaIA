import pandas as pd
from tensorflow import keras
from sklearn.model_selection import train_test_split
from data import BodyPart
import tensorflow as tf

tfjs_model_dir = 'model'


# loading final csv file
def load_csv(csv_path):
    df = pd.read_csv(csv_path)
    df.drop(['filename'], axis=1, inplace=True)
    classes = df.pop('class_name').unique()
    y = df.pop('class_no')

    X = df.astype('float64')
    y = keras.utils.to_categorical(y)

    return X, y, classes
