import React, { Component } from 'react'
import {
    loadModels,
    getFullFaceDescription,
    createMatcher,
    isFaceDetectionModelLoaded
} from './../../api/face'
import { JSON_PROFILE } from './../../common/profile'
import { Form } from './../Form'

const MaxWidth = 600

const testImg =
    'https://d500.epimg.net/cincodias/imagenes/2016/07/04/lifestyle/1467646262_522853_1467646344_noticia_normal.jpg'

const INIT_STATE = {
    url: null,
    imageURL: null,
    file: null,
    fullDesc: null,
    imageDimension: null,
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
            faceMatcher: null,
            showDescriptors: false,
            WIDTH: null,
            HEIGHT: 0,
            isModelLoaded: !!isFaceDetectionModelLoaded()
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
        await this.matcher()
        await this.getImageDimension(testImg)
        await this.setState({ imageURL: testImg, loading: true })
        await this.handleImageChange(testImg)
    }

    matcher = async () => {
        const faceMatcher = await createMatcher(JSON_PROFILE)
        this.setState({ faceMatcher })
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

    handleURLChange = event => {
        this.setState({ url: event.target.value })
    }

    handleButtonClick = async () => {
        this.resetState()
        let blob = await fetch(this.state.url)
            .then(r => r.blob())
            .catch(error => this.setState({ error }))
        if (!!blob && blob.type.includes('image')) {
            this.setState({
                imageURL: URL.createObjectURL(blob),
                loading: true
            })
            this.handleImageChange()
        }
    }

    handleImageChange = async (image = this.state.imageURL) => {
        await this.getImageDimension(image)
        await getFullFaceDescription(image).then(fullDesc => {
            this.setState({ fullDesc, loading: false })
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

    handleDescriptorsCheck = event => {
        this.setState({ showDescriptors: event.target.checked })
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

    register = () => {
        const form = { ...this.state.form }
        let validation = true
        if (!form.name.value.length) {
            form.name.error = 'Nombre es Requerido'
            validation = false
        }
        if (!form.lastName.value.length) {
            form.lastName.error = 'Apellido es Requerido'
            validation = false
        }
        if (!form.email.value.length) {
            form.email.error = 'Correo es Requerido'
            validation = false
        }
        if (
            !form.email.value.match(
                /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
            )
        ) {
            form.email.error = 'Correo es Invalido'
            validation = false
        }
        if (!form.ci.value.length) {
            form.ci.error = 'CI es Requerido'
            validation = false
        }
        if (!form.ci.value.match(/^(\d{8,10})+(\w{2,4})+$/)) {
            form.ci.error = 'CI es Invalido'
            validation = false
        }

        console.log(this.state.fullDesc)
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
            formData.append('ci', form.ci.value)
            formData.append('file', this.state.file)

            this.fetchAPI(formData)
        }
    }

    fetchAPI = async datos => {
        try {
            const res = await fetch('', {
                method: 'POST',
                body: datos,
                headers: {}
            })
            const message = await res.json()
            console.log(message)
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        const { imageURL, fullDesc, error, loading } = this.state

        let status = <p className="text-[#0DFCDF]">Verificando...</p>
        if (!!error && error.toString() === 'TypeError: Failed to fetch') {
            status = (
                <p style={{ color: 'red' }}>
                    Status: Error Failed to fetch Image URL
                </p>
            )
        } else if (loading) {
            status = <p className="text-[#0DFCDF]">LOADING...</p>
        } else if (!!fullDesc && !!imageURL && !loading) {
            if (fullDesc.length === 1)
                status = <p className="text-orangeColor">Imagen Valida</p>
            else status = <p className="text-[#ff0000]">Imagen invalida</p>
        }

        let spinner = (
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
        )
    }
}

export default FaceRecognition
