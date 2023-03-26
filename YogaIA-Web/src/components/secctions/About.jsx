import React from 'react'

export const About = () => {
    return (
        <div>
            <h1 className="text-6xl font-semibold ">
                <p className="mb-6 text-white">About</p>
            </h1>
            <div className="mt-20 mb-20">
                <p className="text-white w-2/4">
                    {`El proyecto "Identificación y Evaluación de Posturas de
                    Yoga" es un sistema de inteligencia artificial que utiliza
                    visión por computadora y redes neuronales para reconocer
                    posturas de yoga a partir de imágenes y videos. El objetivo
                    principal del proyecto es ayudar a los usuarios a mejorar su
                    técnica y evitar lesiones al realizar las posturas de manera
                    incorrecta. Algunas poses que identifica:`}
                </p>
            </div>
            <div className="mt-20 mb-20"></div>
        </div>
    )
}
