import { Col, Row } from "react-bootstrap"
import { EditButton } from "./Buttons"
import { PageCard } from "./PageCard"
import { useLocation } from "react-router-dom"

import dayjs from 'dayjs'

function PageCardList(props) {
    const location = useLocation();

    const sortedPages = props.pages
    sortedPages.sort((a, b) => {
        return dayjs(a.publicationDate).diff(dayjs(b.publicationDate))
    })

    return (
        <div className="d-grid gap-3">
            <Row className='d-flex justify-content-between align-items-center  ms-5 me-5' >
                <Col>{props.title}</Col>
                {location.pathname.includes('backoffice') && <Col sm='auto'><EditButton text={' Crea una nuova pagina'} /></Col>}
            </Row>
            {
                sortedPages.map((page) => {
                    return (<Row key={page.id}>
                        <PageCard page={page}  />
                    </Row>)
                })
            }
        </div>
    )
}

export default PageCardList;