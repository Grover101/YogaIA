import React, { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { useNavigate } from 'react-router-dom'
import { Form } from './Form'
import { getFullFaceDescription } from '../api/face'
import { fetchAPI } from '../helpers/fetch'
import { DataURIToBlob, validationFom } from '../helpers/validation'
import { toast } from 'sonner'

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
    const [errorFetch, setErrorFetch] = useState(null)

    const navigate = useNavigate()
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
        let fileAux = DataURIToBlob(imageSrc)
        let message
        if (fullCaracter.length) {
            const formData = new FormData()
            formData.append('photo', fileAux)
            message = await fetchAPI(formData, '/users/verify')
            fileAux = !message ? fileAux : null
        }

        setFile(fileAux)
        setError(
            fullCaracter.length !== 1
                ? 'No Hay rostro, no use ningun objeto en el rostro'
                : message
                ? `Esta persona es ${message.name} ya esta registrada`
                : null
        )
        setFullDesc(fullCaracter)
    }, [webcamRef])

    const formData = (key, value) => {
        const atri = {}
        atri[key] = value
        const formAux = { ...form, ...atri }
        setForm(formAux)
    }

    const register = async () => {
        let [validation, formAux] = validationFom({ ...form })

        if (!file) {
            setError('No se saco foto')
            validation = false
        } else if (fullDesc?.length !== 1) {
            setError('No hay rostro, no use ningun objeto en el rostro')
            validation = false
        } else setError(null)

        setForm(formAux)
        if (validation) {
            const formData = new FormData()
            formData.append('name', formAux.name.value)
            formData.append('lastName', formAux.lastName.value)
            formData.append('email', formAux.email.value)
            formData.append('date', formAux.date.value)
            formData.append('genero', formAux.genero.value)
            formData.append('ci', formAux.ci.value)
            formData.append('photo', file)
            const response = await fetchAPI(formData, '/users')
            if (response?.error) {
                toast.error('Error al Registrar Usuario')
                setErrorFetch({ value: response.error, state: true })
            } else {
                toast.success('Register Success!!!')
                setErrorFetch({ value: 'Usuario Registrado', state: false })
                setTimeout(() => {
                    navigate('/evaluate')
                }, 1500)
            }
        }
    }

    return (
        <>
            {errorFetch ? (
                <div
                    className={`rounded w-full m-auto z-10 bg-[${
                        errorFetch.state ? '#FF0000' : '#25E000'
                    }] text-white`}
                >
                    {errorFetch.value}
                </div>
            ) : null}
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
                            <p className="block mt-2 text-xl font-medium text-[#ff0000] dark:text-[#ff0000] bg-transparent">
                                {error}
                            </p>
                        ) : img ? (
                            <p className="block mt-2 text-xl font-medium text-[#00ff2a] dark:text-[#00ff2a] bg-transparent">
                                Foto Correcta
                            </p>
                        ) : null}
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
                    <Form
                        form={form}
                        formState={formData}
                        register={register}
                    />
                </div>
            </div>
        </>
    )
}

export default WebcamImage
