import React, { useEffect, useState } from 'react'

import tree from '../../assets/tree.jpg'
import traingle from '../../assets/traingle.jpg'
import warrior from '../../assets/warrior.jpg'
import chair from '../../assets/chair.jpg'
import shouldler from '../../assets/shoulder.jpg'
import chakravakasana from '../../assets/chakravakasana.jpg'
import dwiPadaViparitaDandasana from '../../assets/dwiPadaViparitaDandasana.jpg'
import profileDefult from '../../assets/default.jpg'
import { yearOld } from '../../helpers/validation'
import { toast } from 'sonner'

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
    const user = JSON.parse(localStorage.getItem('user'))
    const [photo, setPhoto] = useState(null)
    const [details, setDetails] = useState({
        timeWeek: '00:00:00',
        exercisePerformed: []
    })

    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const resPhoto = await fetch(
                    `http://localhost:9000/api/users/photo/${user.id}`,
                    { method: 'GET' }
                )
                const dataPhoto = await resPhoto.json()
                if (resPhoto.status === 200)
                    setPhoto(`data:image/jpg;base64,${dataPhoto.base}`)
                else toast.error('Error al traer la Foto de Perfil')

                const resData = await fetch(
                    `http://localhost:9000/api/activity/${user.id}`,
                    { method: 'GET' }
                )
                const data = await resData.json()
                if (resData.status === 200)
                    setDetails({
                        timeWeek: data.timeTotal,
                        exercisePerformed: data.activities
                    })
                else toast.error('Error al traer la Foto de Perfil')
            } catch (error) {
                toast.error(`Error en la peticion\n ${error}`)
                console.log(error)
            }
        }
        fetchAPI()
    }, [])

    return (
        <>
            <h1 className="text-6xl font-semibold mb-6">
                <span className="text-white">Perfil</span>
            </h1>
            <div className="flex bg-white/80 rounded-xl">
                <div className="w-4/6 p-6 text-center">
                    <h3 className="font-bold text-2xl text-orangeColor">
                        TIEMPO TOTAL
                    </h3>
                    <span className="text-5xl">{details.timeWeek}</span>
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
                                            <p>{detail.date}</p>
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
                            className="rounded-full"
                            src={photo ?? profileDefult}
                            alt="profile"
                        />
                    </div>
                    <div className="mt-4 m-auto w-2/4">
                        <p>
                            <strong>Usuario: </strong>
                            {`${user.name} ${user.lastName}`}
                        </p>
                        <p>
                            <strong>Edad: </strong> {yearOld(user.date)}
                        </p>
                        <p>
                            <strong>Genero: </strong>
                            {user.genero}
                        </p>
                        <p>
                            <strong>Correo: </strong>
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
