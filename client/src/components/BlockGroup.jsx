import React, { useState } from "react";
import { Row, Col, Button, FormGroup, Form, InputGroup, Image } from "react-bootstrap";

function BlockGroup(props) {
    const [value, setValue] = useState(props.value)

    const handleChange = (e) => {
        setValue(e.target.value)
        props.onStateChange(e.target.value, props.idkey)
    }

    return (
        <Row>
            <Col>
                <FormGroup>
                    {(props.type === 'Image') ? <div>
                        <Form.Label>{(props.type + " " + String(props.img.name))}</Form.Label> <br />
                        <Image src={props.img.img} style={{ height: '100px', width: '100px' }} />
                    </div>
                        :
                        <InputGroup>
                            <InputGroup.Text>{props.type}</InputGroup.Text>
                            {(props.type === 'Paragraph') ?
                                <Form.Control value={value} as='textarea' type="text" id={props.id} onChange={handleChange} /> :
                                <Form.Control value={value} as='input' type="text" id={props.id} onChange={handleChange} />}
                        </InputGroup>}
                </FormGroup>
            </Col>
            <Col sm='auto'>
                <Button className="me-1" onClick={() => { props.deleteElement(props.id) }} variant='danger'><i className="bi bi-trash"></i></Button>
                <Button className="me-1" onClick={() => props.moveElement(props.index, -1, value)}><i className="bi bi-arrow-up"></i></Button>
                <Button onClick={() => props.moveElement(props.index, +1, value)}><i className="bi bi-arrow-down"></i></Button>
            </Col>
        </Row >)

}

export default BlockGroup;
