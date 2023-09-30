import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import {  useState } from 'react';

import { BackButton, DeleteButton, EditButton } from './Buttons';
import API from '../API'

function PageCardExpanded(props) {
    const location = useLocation();
    const page = location.state.page;
    const navigate = useNavigate();
    //const order = location.state.order
    //const sorted = page.contents.sort((a, b) => { return (a.position - b.position) })

    //modal for check when deleting
    const [showAlert, setShowAlert] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    //const [message, setMessage] = useState('')

    const handleDelete = async () => {
        setShowAlert(false);
        try {
            await API.deletePage(page.id)
            const pages = await API.listPages()
            props.setPages(pages)
            setShowMessage(true)
            navigate('/backoffice')
        } catch (error) {
            props.handleErrors(error)
        }
    }

    return (
        <Container fluid className="d-grid gap-3 ">
            <Modal show={showAlert} onHide={() => setShowAlert(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this page?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAlert(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleDelete}>
                        Yes, I'm sure!
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal>
                <Modal.Header show={showMessage} onHide={() => setShowMessage(false)}>
                    <Modal.Title>Delete operation</Modal.Title>
                </Modal.Header>
                <Modal.Body>{props.message}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowMessage(false)
                    }}>
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>

            
            <Row className='d-flex justify-content-between align-items-center align-self-center'>
                <Col><BackButton back={location.pathname.includes('backoffice') ? '/backoffice' : '/frontoffice'}/></Col>
                <Col className='col-text-right me-1'>Publication Date: {page.publicationDate}</Col>
                {location.pathname.includes('backoffice') && (props.user.username === page.author || props.user.role === 'ADMIN') && (<><Col sm='auto' ><EditButton page={page} /></Col><Col sm='auto'><DeleteButton handleClick={() => setShowAlert(true)} /></Col></>)}
            </Row>

            <Card>
                <Card.Header>{page.title}</Card.Header>
                <Card.Body>
                    {page.contents.sort((a, b) => { return (a.position - b.position) }).map(el => {
                        if (el.type === 1) {
                            return (<Card.Title key={el.id}>{el.content}</Card.Title>)
                        } else if (el.type === 2) {
                            return (<Card.Text key={el.id}>{el.content}</Card.Text>)
                        } else if (el.type === 3) {
                            return (<Card.Img key={el.id} src={el.content} style={{
                                height: '200px',
                                width: '200px'
                            }} />)
                        }
                    })}
                    <Card.Text>
                        {page.content}
                    </Card.Text>
                    <Card.Link>{page.author}</Card.Link>
                </Card.Body>
            </Card>
        </Container>
    )
}

export { PageCardExpanded };