export const Form = ({ form, formState, register }) => {
    const { name, lastName, date, email, ci, genero } = form
    const handleButtonClick = () => {
        register()
    }

    return (
        <div className="w-full max-w-lg p-4">
            <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                        className="block uppercase tracking-wide text-orangeColor text-xs font-bold mb-2"
                        htmlFor="grid-first-name"
                    >
                        Nombre
                    </label>
                    <input
                        className="appearance-none block w-full border border-orangeColor rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-xs"
                        id="grid-first-name"
                        type="text"
                        placeholder="Juan"
                        value={name.value}
                        onChange={e => {
                            formState('name', {
                                value: e.target.value,
                                error: null
                            })
                        }}
                    />
                    {name.error ? (
                        <p className="text-[#ff0000] text-xs italic">
                            {name.error}
                        </p>
                    ) : null}
                </div>
                <div className="w-full md:w-1/2 px-3">
                    <label
                        className="block uppercase tracking-wide text-orangeColor text-xs font-bold mb-2"
                        htmlFor="grid-last-name"
                    >
                        Apellido
                    </label>
                    <input
                        className="appearance-none block w-full border border-orangeColor rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-xs"
                        id="grid-last-name"
                        type="text"
                        placeholder="Perez"
                        value={lastName.value}
                        onChange={e => {
                            formState('lastName', {
                                value: e.target.value,
                                error: null
                            })
                        }}
                    />
                    {lastName.error ? (
                        <p className="text-[#ff0000] text-xs italic">
                            {lastName.error}
                        </p>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full md:w-1/2 px-3">
                    <label
                        className="block uppercase tracking-wide text-orangeColor text-xs font-bold mb-2"
                        htmlFor="grid-password"
                    >
                        Correo
                    </label>
                    <input
                        className="appearance-none block w-full border border-orangeColor rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-orangeColor text-xs"
                        id="grid-password"
                        type="email"
                        placeholder="juan@gmail.com"
                        value={email.value}
                        onChange={e => {
                            formState('email', {
                                value: e.target.value,
                                error: null
                            })
                        }}
                    />
                    {email.error ? (
                        <p className="text-[#ff0000] text-xs italic">
                            {email.error}
                        </p>
                    ) : null}
                </div>
                <div className="w-full md:w-1/2 px-3">
                    <label
                        className="block uppercase tracking-wide text-orangeColor text-xs font-bold mb-2"
                        htmlFor="grid-last-name"
                    >
                        Ci
                    </label>
                    <input
                        className="appearance-none block w-full border border-orangeColor rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white text-xs"
                        id="grid-last-name"
                        type="text"
                        placeholder="12345678CH"
                        value={ci.value}
                        onChange={e => {
                            formState('ci', {
                                value: e.target.value.toUpperCase(),
                                error: null
                            })
                        }}
                    />
                    {ci.error ? (
                        <p className="text-[#ff0000] text-xs italic">
                            {ci.error}
                        </p>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                        className="block uppercase tracking-wide text-orangeColor text-xs font-bold mb-2"
                        htmlFor="grid-city"
                    >
                        Fecha de Nacimiento
                    </label>
                    <input
                        className="appearance-none block w-full border border-orangeColor rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-orangeColor text-xs"
                        id="grid-city"
                        type="date"
                        placeholder="Albuquerque"
                        value={date.value}
                        onChange={e => {
                            formState('date', {
                                value: e.target.value,
                                error: null
                            })
                        }}
                    />
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                        className="block uppercase tracking-wide text-orangeColor text-xs font-bold mb-2"
                        htmlFor="grid-state"
                    >
                        Genero
                    </label>
                    <div className="relative text-xs">
                        <select
                            className="block appearance-none w-full h-full border border-orangeColor text-blckGray py-3 px-4 rounded leading-tight focus:outline-none"
                            id="grid-state"
                            select={genero.value}
                            onChange={e => {
                                formState('genero', {
                                    value: e.target.value,
                                    error: null
                                })
                            }}
                        >
                            <option>Otros</option>
                            <option>Masculino</option>
                            <option>Femenino</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-orangeColor">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap mt-9">
                <div className="w-full md:w-full px-3">
                    <button
                        className={`text-sm transition inline-flex items-center  font-semibold border rounded-lg px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor`}
                        onClick={handleButtonClick}
                    >
                        REGISTRARSE
                    </button>
                </div>
            </div>
        </div>
    )
}
