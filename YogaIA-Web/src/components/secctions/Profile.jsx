import React, { useEffect, useState } from 'react'

import tree from '../../assets/tree.jpg'
import traingle from '../../assets/traingle.jpg'
import warrior from '../../assets/warrior.jpg'
import chair from '../../assets/chair.jpg'
import shouldler from '../../assets/shoulder.jpg'
import chakravakasana from '../../assets/chakravakasana.jpg'
import dwiPadaViparitaDandasana from '../../assets/dwiPadaViparitaDandasana.jpg'

const imgPose = {
    Chair: chair,
    Chakravakasana: chakravakasana,
    Cobra: chair,
    DwiPadaViparitaDandasana: dwiPadaViparitaDandasana,
    Shoudler: shouldler,
    Traingle: traingle,
    Tree: tree,
    Warrior: warrior
}

export const Profile = () => {
    const [details, setDetails] = useState({
        timeWeek: { hours: 0, minutes: 8, seconds: 35 },
        exercisePerformed: [
            { name: 'Tree', time: '00:04:25', evaluate: 95.4 },
            { name: 'Chair', time: '00:02:55', evaluate: 90.2 },
            { name: 'Traingle', time: '00:01:15', evaluate: 97.9 }
        ]
    })

    return (
        <>
            <h1 className="text-6xl font-semibold mb-6">
                <span className="text-white">Perfil</span>
            </h1>
            <div className="flex bg-white/80 rounded-xl">
                <div className="w-4/6 p-6 text-center">
                    <h3 className="font-bold text-2xl text-orangeColor">
                        TIEMPO SEMANAL
                    </h3>
                    <span className="text-5xl">
                        {details.timeWeek.hours < 10
                            ? `0${details.timeWeek.hours}`
                            : details.timeWeek.hours}
                        :
                        {details.timeWeek.minutes < 10
                            ? `0${details.timeWeek.minutes}`
                            : details.timeWeek.minutes}
                        :
                        {details.timeWeek.seconds < 10
                            ? `0${details.timeWeek.seconds}`
                            : details.timeWeek.seconds}
                    </span>
                    <div className="mt-5">
                        <ul>
                            {details.exercisePerformed.map((detail, index) => (
                                <li
                                    key={`${detail.name}-${index}`}
                                    className="mb-3"
                                >
                                    <div className="flex bg-blckGray rounded-xl text-white">
                                        <div className="w-2/6 h-32">
                                            <img
                                                className="rounded-l-xl h-full"
                                                src={imgPose[detail.name]}
                                                alt={detail.name}
                                            />
                                        </div>
                                        <div className="w-2/6  m-auto text-xl">
                                            <p className="font-bold">
                                                {detail.name}
                                            </p>
                                            <p>{detail.time}</p>
                                        </div>
                                        <div className="w-2/6 m-auto text-5xl">
                                            {detail.evaluate}%
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="w-4/12 p-6">
                    <div className="text-center m-auto w-2/4">
                        <img
                            className="rounded-full
                            "
                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                            alt=""
                        />
                    </div>
                    <div className="mt-4 m-auto w-2/4">
                        <p>
                            <strong>Usuario: </strong>Grover Limachi
                        </p>
                        <p>
                            <strong>Edad: </strong>22
                        </p>
                        <p>
                            <strong>Genero: </strong>Masculino
                        </p>
                        <p>
                            <strong>Correo: </strong>email@email.com
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
