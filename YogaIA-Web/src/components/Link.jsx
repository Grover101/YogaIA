import React from 'react'
import { Link } from 'react-router-dom'
import './../styles/Link.css'

export const LinkRoute = ({
    classLink = '',
    disabled,
    to,
    isExternal,
    title
}) => {
    const anchorProps = isExternal ? { target: '_blank', rel: 'noopener' } : {}

    return (
        <Link
            to={to}
            className={`${classLink} ${
                disabled ? 'text-white' : 'text-primary'
            } group relative py-3 leading-tight font-extrabold transition hover:text-orangeColor text-2xl`}
            {...anchorProps}
        >
            <span className={disabled ? 'opacity-70' : ''}>{title}</span>
        </Link>
    )
}
