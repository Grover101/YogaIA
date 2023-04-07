import React, { Component } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadModels, getFullFaceDescription } from './../../api/face'
import { Form } from './../Form'
import { fetchAPI } from '../../helpers/fetch'
import { validationFom } from '../../helpers/validation'
import testImg from './../../assets/default.jpg'
const MaxWidth = 600

const INIT_STATE = {
    imageURL: null,
    file: null,
    fullDesc: null,
    error: null,
    loading: false
}

const FORM_STATE = {
    form: {
        name: { value: '', error: null },
        lastName: { value: '', error: null },
        date: { value: '', error: null },
        email: { value: '', error: null },
        ci: { value: '', error: null },
        genero: { value: 'Otros', error: null }
    }
}

class FaceRecognition extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...INIT_STATE,
            ...FORM_STATE,
            WIDTH: null,
            HEIGHT: 0,
            errorFetch: null
        }
    }

    componentWillMount() {
        this.resetState()
        let _W = document.documentElement.clientWidth
        if (_W > MaxWidth) _W = MaxWidth
        this.setState({ WIDTH: _W })
        this.mounting()
    }

    mounting = async () => {
        await loadModels()
        await this.getImageDimension(testImg)
        await this.setState({ imageURL: testImg, loading: true })
        await this.handleImageChange(testImg)
    }

    handleFileChange = async event => {
        this.resetState()
        await this.setState({
            imageURL: URL.createObjectURL(event.target.files[0]),
            file: event.target.files[0],
            loading: true
        })
        this.handleImageChange()
    }

    handleImageChange = async (image = this.state.imageURL) => {
        await this.getImageDimension(image)
        const fullDesc = await getFullFaceDescription(image)
        let message
        if (fullDesc.length) {
            const formData = new FormData()
            formData.append('photo', this.state.file)
            message = await fetchAPI(formData, '/users/verify')
        }
        this.setState({
            error: message ? 'La foto de este Usuario ya existe' : null,
            fullDesc,
            loading: false
        })
    }

    getImageDimension = imageURL => {
        let img = new Image()
        img.onload = () => {
            let HEIGHT = (this.state.WIDTH * img.height) / img.width
            this.setState({
                HEIGHT
            })
        }
        img.src = imageURL
    }

    resetState = () => {
        this.setState({ ...INIT_STATE })
    }

    formData = (key, value) => {
        const atri = {}
        atri[key] = value
        const form = { ...this.state.form, ...atri }
        this.setState({ form })
    }

    register = async () => {
        let [validation, form] = validationFom({ ...this.state.form })

        if (this.state.fullDesc?.length !== 1) {
            console.log('No Hay rostro')
            validation = false
        }

        this.setState({ form })
        if (validation) {
            const formData = new FormData()
            formData.append('name', form.name.value)
            formData.append('lastName', form.lastName.value)
            formData.append('email', form.email.value)
            formData.append('date', form.date.value)
            formData.append('genero', form.genero.value)
            formData.append('ci', form.ci.value)
            formData.append('photo', this.state.file)
            const response = await fetchAPI(formData, '/users')
            if (response?.error)
                this.setState({
                    errorFetch: { value: response.error, state: true }
                })
            else {
                this.setState({
                    errorFetch: { value: 'Usuario Registrado', state: false }
                })
                setTimeout(() => {
                    this.props.history('/evaluate')
                }, 1000)
            }
        }
    }

    render() {
        const { imageURL, fullDesc, error, loading, errorFetch } = this.state

        let status = <p className="text-[#0DFCDF]">Verificando...</p>
        if (loading) {
            status = <p className="text-[#0DFCDF]">LOADING...</p>
        } else if (!!fullDesc && !!imageURL && !loading) {
            if (fullDesc.length === 1)
                status = error ? (
                    <p className="text-[#ff0000]">{error}</p>
                ) : (
                    <p className="text-orangeColor">Imagen Valida</p>
                )
            else status = <p className="text-[#ff0000]">Imagen invalida</p>
        }

        const spinner = (
            <div className="flex h-[300px]">
                <div className="m-auto">
                    <svg
                        className="animate-spin h-28 w-28 mr-3"
                        width="64px"
                        height="64px"
                        strokeWidth="2.2"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#EF6F13"
                    >
                        <path
                            d="M21.168 8A10.003 10.003 0 0012 2C6.815 2 2.55 5.947 2.05 11"
                            stroke="#EF6F13"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                        <path
                            d="M17 8h4.4a.6.6 0 00.6-.6V3M2.881 16c1.544 3.532 5.068 6 9.168 6 5.186 0 9.45-3.947 9.951-9"
                            stroke="#EF6F13"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                        <path
                            d="M7.05 16h-4.4a.6.6 0 00-.6.6V21"
                            stroke="#EF6F13"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                    </svg>
                </div>
            </div>
        )

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
                    <div className="w-1/2 text-center">
                        <div className="flex-row m-auto p-4">
                            {loading ? (
                                spinner
                            ) : imageURL ? (
                                <div className="text-center m-auto h-[300px]">
                                    <img
                                        style={{ height: '100%' }}
                                        src={imageURL}
                                        alt="imageURL"
                                        className="m-auto pt-2"
                                    />
                                </div>
                            ) : null}
                            <div className="mt-1 p-1">
                                <label className="block mb-2 text-xl font-medium text-orangeColor dark:text-white bg-transparent">
                                    {status}
                                </label>
                                <input
                                    className="relative m-0 block w-full min-w-0 flex-auto rounded border-2 border-solid border-orangeColor bg-clip-padding py-[0.32rem] px-3 text-base font-normal text-white transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-orangeColor file:px-3 file:py-[0.32rem] file:text-white file:transition file:duration-150 file:ease-in-out file:[margin-inline-end:0.75rem] file:[border-inline-end-width:1px] hover:file:bg-orangeColor focus:border-primary focus:text-whitefocus:shadow-[0_0_0_1px] focus:shadow-primary focus:outline-none "
                                    id="myFileUpload"
                                    type="file"
                                    onChange={this.handleFileChange}
                                    accept=".jpg, .jpeg, .png"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-2/4">
                        <Form
                            form={this.state.form}
                            formState={this.formData}
                            register={this.register}
                        />
                    </div>
                </div>
            </>
        )
    }
}

export default props => <FaceRecognition history={useNavigate()} />
