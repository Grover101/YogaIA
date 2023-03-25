import React from 'react'
import { Icons } from './Icons'
import { Link } from './Link'

const NAVIGATION_LINKS = [
    {
        title: 'Inicio',
        href: '#top'
    },
    {
        title: 'About',
        href: '#sponsors'
    },
    {
        title: 'Speakers',
        href: '#speakers'
    }
]

const SOCIAL_NETWORKS_LINKS = [
    {
        component: Icons.facebook,
        title: 'facebook',
        icon: 'facebook-icon.svg',
        href: 'https://twitch.tv/midudev'
    },
    {
        component: Icons.linkedin,
        title: 'linkedin',
        icon: 'linkedin-icon.svg',
        href: 'https://instagram.com/midu.dev'
    },
    {
        component: Icons.twitter,
        title: 'twitter',
        icon: 'twitter-icon.svg',
        href: 'https://twitter.com/midudev'
    }
]

export const Navigation = () => {
    return (
        <aside className="flex flex:row items-center justify-between xl:justify-center text-primary px-4 xl:pb-20 xl:sticky xl:top-0 xl:flex-col xl:min-h-screen">
            <a href="/#top" className="w-full h-full xl:h-auto py-6">
                <Icons.logo className="xl:w-32 w-72 lg:w-80 h-full mx-auto animate-zoomIn" />
            </a>

            <input type="checkbox" id="menu" hidden className="peer" />
            <label
                // for="menu"
                className="bg-zinc-800 w-14 h-14 border-zinc-500 flex items-center justify-center rounded-full border fixed right-4 top-4 xl:relative z-50 xl:hidden peer-checked:[&>.first]:hidden peer-checked:[&>.last]:block cursor-pointer hover:scale-125 transition hover:border-white"
            >
                {/* <MenuIcon /> */}
            </label>

            <nav
                id="navbar"
                className="min-h-screen last fixed top-0 left-0 pointer-events-none opacity-0 peer-checked:opacity-100 peer-checked:pointer-events-auto right-0 z-40 flex py-12 px-8 bg-black/30 backdrop-blur-lg text-center xl:opacity-100 xl:pointer-events-auto xl:min-h-0 xl:relative xl:px-0 justify-center flex-col xl:backdrop-blur-0 xl:mt-1 transition-opacity xl:transition-all"
            >
                <ul className="flex flex-col gap-y-8 mb-20">
                    {NAVIGATION_LINKS.map(({ disabled, title, href }) => {
                        return (
                            <li key={`rute-${title}`}>
                                <Link
                                    disabled={disabled}
                                    href={href}
                                    title={title}
                                />
                            </li>
                        )
                    })}
                </ul>

                <div className="flex flex-row items-center justify-center gap-4 py-2">
                    {SOCIAL_NETWORKS_LINKS.map(
                        ({ component: Icon, href, title }) => {
                            return (
                                <a
                                    key={`red-${title}`}
                                    className="text-white hover:scale-125 transition-all hover:text-primary"
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span aria-label={title}>
                                        <Icon />
                                    </span>
                                </a>
                            )
                        }
                    )}
                </div>
            </nav>
        </aside>
    )
}
