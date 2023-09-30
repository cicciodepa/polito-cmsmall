import espeon from '/images/espeon.png'
import umbreon from '/images/umbreon.png'
import sylveon from '/images/sylveon.png'
import flareon from '/images/flareon.png'
import vaporeon from '/images/vaporeon.png'
import leafeon from '/images/leafeon.png'
import glaceon from '/images/glaceon.png'
import eevee from '/images/eevee.png'
import jolteon from '/images/jolteon.png'

import { Image, NavDropdown } from 'react-bootstrap'

const imgArray = [
    { img: eevee, name: 'eevee' },
    { img: jolteon, name: 'jolteon' },
    { img: flareon, name: 'flareon' },
    { img: vaporeon, name: 'vaporeon' },
    { img: espeon, name: 'espeon' },
    { img: umbreon, name: 'umbreon' },
    { img: leafeon, name: 'leafeon' },
    { img: glaceon, name: 'glaceon' },
    { img: sylveon, name: 'sylveon' }
  ];
  
function ImageSelecter(props) {
    const selector = imgArray.map(image => {
        return <NavDropdown.Item key={image.name}>
            <Image src={image.img}
                onClick={() => {
                    props.selectImage(image)
                }} style={{ width: '100px', height: '100px' }} />
        </NavDropdown.Item>
    })

    return selector
}


export { imgArray, ImageSelecter }