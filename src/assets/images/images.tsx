import logo from './Logo.png'

const IMAGES = {
  logo: logo,
 
}

export type ImageName = keyof typeof IMAGES

interface AppImageProps {
    name: ImageName
    style?: React.CSSProperties
}

export const AppImage = ({name, style}: AppImageProps) => {
    return(
        <img 
        src={IMAGES[name]} 
        alt="Logo" 
        style={style}
        />
    )
}


