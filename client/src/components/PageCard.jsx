import { Row, Col, Card } from 'react-bootstrap';
import {  useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import {ReadMoreButton } from './Buttons';

function PageCard(props) {
    const page = props.page;

    const minIndex = page.contents.map(el => {return el.position}).reduce((min, current) => {
        if(current < min) {return current}
        else {return min}
    })

    const location = useLocation();

    function getStatus() {
        if (page.publicationDate === '') return ('Draft')
        if (dayjs().isAfter(page.publicationDate)) return ('Published')
        if (dayjs(page.publicationDate).isAfter(dayjs())) return ('Scheduled')
    }
    const status = getStatus()

    return (
        <div className="d-grid gap-3">
            <Card className='ms-5 me-5'>

                {location.pathname.includes('backoffice') ?
                    <Card.Header>
                        <Row><Card.Text>Creation Date: {page.creationDate}</Card.Text></Row>
                        <Row>
                            <Col>Publication Date: {page.publicationDate}</Col>
                            <Col sm={2}><Card.Text>{status}</Card.Text></Col>
                        </Row>
                    </Card.Header> : <Card.Header>Publication Date: {page.publicationDate}</Card.Header>}

                <Card.Body>
                    <Card.Title>{page.title}</Card.Title>
                    <Card.Text>{page.contents.filter(el => el.position === minIndex)[0].content}...</Card.Text>
                </Card.Body>

                <Card.Footer className='position-relative' >
                    <ReadMoreButton page={page}  />
                    <Card.Text className='position-absolute top-50 end-0 translate-middle'>Author: <Card.Link className='link-color'>{page.author}</Card.Link></Card.Text>
                </Card.Footer>
            </Card>
        </div>
    )
}

export { PageCard };