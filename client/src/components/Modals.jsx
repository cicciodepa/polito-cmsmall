import { Modal, Button, Form } from "react-bootstrap";

function TwoButtonsModal(props) {
    return (
        <Modal show={props.modal.state} onHide={() => props.modal.setModal(false)}>
            <Modal.Header>
                <Modal.Title>{props.modal.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{props.modal.body}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => { props.modal.setModal(false); props.furtherAction1() }}>
                    {props.modal.button1}
                </Button>
                <Button variant="primary" onClick={() => { props.modal.setModal(false); props.furtherAction2() }}>
                    {props.modal.button2}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function FormModal(props) {

    return (
        <Modal show={props.modal.state} onHide={() => props.modal.setModal(false)}>
            <Modal.Header>
                <Modal.Title>{props.modal.title}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={(e) => { props.handleSubmit(e) }}>
                <Modal.Body>
                    <Form.Text>{props.modal.formtext}</Form.Text>
                    <Form.Control type='text' placeholder={props.modal.value} onChange={(e) => { props.modal.setValue(e.target.value) }}></Form.Control>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { props.modal.setModal(false) }}>
                        {props.modal.button1}
                    </Button>
                    <Button variant="primary" type='submit' >
                        {props.modal.button2}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}


export { TwoButtonsModal, FormModal };