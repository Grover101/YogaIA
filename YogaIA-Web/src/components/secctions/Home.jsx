import { Link } from 'react-router-dom'

export const Home = () => {
    return (
        <>
            <h1 className="text-6xl font-semibold ">
                <p className="mb-6 text-white">Identificacion y</p>
                <p className="mb-6 text-white">Evaluacion de Posturas</p>
                <p className="mb-6 text-white">de Yoga</p>
            </h1>
            <div className="mt-20 mb-20">
                <p className="text-white">
                    No pierdas tu impulso a conocer algo nuevo
                </p>
            </div>
            <div className="mt-20 mb-20">
                <Link
                    to="/evaluate"
                    className="text-sm transition inline-flex items-center  font-semibold border rounded-lg px-6 py-3 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-zinc-900/90 bg-orangeColor"
                >
                    Comenzar Identificacion y Evaluacion
                </Link>
            </div>
        </>
    )
}
