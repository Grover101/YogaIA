import React, { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Form } from './Form'
import { getFullFaceDescription } from '../api/face'

function WebcamImage() {
    const [img, setImg] = useState(null)
    const [form, setForm] = useState({
        name: { value: '', error: null },
        lastName: { value: '', error: null },
        date: { value: '', error: null },
        email: { value: '', error: null },
        ci: { value: '', error: null },
        genero: { value: 'Otros', error: null }
    })
    const [file, setFile] = useState(null)
    const [fullDesc, setFullDesc] = useState([])
    const [error, setError] = useState(null)

    const webcamRef = useRef(null)

    const videoConstraints = {
        width: 420,
        height: 420,
        facingMode: 'user'
    }

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current.getScreenshot()
        setImg(imageSrc)
        const fullCaracter = await getFullFaceDescription(imageSrc)
        setError(fullCaracter.length !== 1 ? 'No Hay rostro' : null)
        setFullDesc(fullCaracter)

        const body = imageSrc.split(',')[1]
        const blob = new Blob([atob(body)], {
            type: 'image/jpg',
            encoding: 'utf-8'
        })
        const fileAux = new File([blob], 'perfil')
        setFile(fileAux)
    }, [webcamRef])

    const formData = (key, value) => {
        const atri = {}
        atri[key] = value
        const formAux = { ...form, ...atri }
        // this.setState({ formAux })
        setForm(formAux)
    }

    const register = () => {
        const formAux = { ...form }
        let validation = true
        if (!formAux.name.value.length) {
            formAux.name.error = 'Nombre es Requerido'
            validation = false
        }
        if (!formAux.lastName.value.length) {
            formAux.lastName.error = 'Apellido es Requerido'
            validation = false
        }
        if (!formAux.email.value.length) {
            formAux.email.error = 'Correo es Requerido'
            validation = false
        }
        if (
            !formAux.email.value.match(
                /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
            )
        ) {
            formAux.email.error = 'Correo es Invalido'
            validation = false
        }
        if (!formAux.ci.value.length) {
            formAux.ci.error = 'CI es Requerido'
            validation = false
        }
        if (!formAux.ci.value.match(/^(\d{8,10})+(\w{2,4})+$/)) {
            formAux.ci.error = 'CI es Invalido'
            validation = false
        }
        if (!file) {
            setError('No se saco foto')
            validation = false
        } else if (fullDesc?.length !== 1) {
            setError('No Hay rostro')
            validation = false
        } else setError(null)

        setForm(formAux)
        if (validation) {
            const formData = new FormData()
            formData.append('name', formAux.name.value)
            formData.append('lastName', formAux.lastName.value)
            formData.append('email', formAux.email.value)
            formData.append('date', formAux.date.value)
            formData.append('ci', formAux.ci.value)
            formData.append('file', file)
            console.log(formAux, file)
            // this.fetchAPI(formData)
        }
    }
    return (
        <div className="flex mb-4">
            <div className="w-1/2 text-center ">
                <div className="w-full">
                    {img === null ? (
                        <Webcam
                            className="m-auto  left-0 right-0 "
                            audio={false}
                            mirrored={true}
                            height={400}
                            width={400}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                        />
                    ) : (
                        <img
                            className="m-auto  left-0 right-0"
                            src={img}
                            alt="screenshot"
                        />
                    )}
                    {error ? (
                        <p className="block mt-2 text-xl font-medium text-[#ff0000] dark:text-white bg-transparent">
                            {error}
                        </p>
                    ) : (
                        <></>
                    )}
                    <button
                        className="text-sm mt-2 transition font-semibold border rounded-lg px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor w-4/12 top-48 m-auto"
                        onClick={
                            img === null
                                ? capture
                                : () => {
                                      setImg(null)
                                      setFile(null)
                                      setFullDesc([])
                                      setError(null)
                                  }
                        }
                    >
                        {img === null ? 'Capturar Foto' : 'Volver a Tomar'}
                    </button>
                </div>
            </div>

            <div className="w-2/4">
                <Form form={form} formState={formData} register={register} />
            </div>
        </div>
    )
}

export default WebcamImage
