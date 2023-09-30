import { Container, Row, Col, Button, DropdownButton, NavDropdown, Form, InputGroup, Card, Alert } from "react-bootstrap";

import dayjs from 'dayjs';
import API from '../API'

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'

import { ImageSelecter } from "./Images";
import { BackButton, CancelButton } from "./Buttons";
import BlockGroup from "./BlockGroup";
import { TwoButtonsModal } from "./Modals";



function PageForm(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const page = location.state.page

    //page attributes setters
    const [author, setAuthor] = useState(page !== undefined ? { id: page.authorID, username: page.author }:{ id: props.user.id, username: props.user.username }) //page author default the user who creates
    const [title, setTitle] = useState(page !== undefined ? page.title : '')
    const [creationDate, setCreationDate] = useState(dayjs().format('YYYY-MM-DD HH:mm'))
    const [publicationDate, setPublicationDate] = useState(page !== undefined ? page.publicationDate : '')

    const [submittedPage, setSubmittedPage] = useState({})
    //used for adding dynamic blocks 
    const [cardBody, setCardBody] = useState([]);
    const [keys, setKeys] = useState(1)

    //in order to allow admin change author
    const [authors, setAuthors] = useState([])

    //to display alert messages
    //const [showAlert, setShowAlert] = useState(false);
    //const [message, setMessage] = useState('')
    //
    const [modalSubmitted, setModalSubmitted] = useState(false)
    const [modalDeleteElement, setModalDeleteElement] = useState(false)

    const moveContents = (array, fromIndex, toIndex) =>  {
        const arrCopy = [...array];
        var element = arrCopy[fromIndex];
    
        arrCopy.splice(fromIndex, 1);
        arrCopy.splice(toIndex, 0, element);
    
        return arrCopy;
    }
    //set page props if page is passed
    useEffect(() => {
        props.setLoading(true);
        if (page !== undefined) {
            setTitle(page.title)
            const body = page.contents.map((el, index) => {
                const type = el.type === 1 && 'Header' || el.type === 2 && 'Paragraph' || el.type === 3 && 'Image'
                const image = el.type === 3 ? {img: el.content, name: el.content.split('/').pop().split('.')[0].toUpperCase()} : ''
                return {
                    oldid: el.id,
                    key: `o-component#${el.id}`, 
                    id: `component#${index}`,
                    type: `${type}`,
                    value: `${el.content}`,
                    img: image
                }
            })
            setCardBody(body)
        }
        props.setLoading(false);
    }, [])

    //set author names for admin if admin
    useEffect(() => {
        const initUsernames = async () => {
            try {
                props.setLoading(true);
                const usernames = await API.listUIDS()
                setAuthors(usernames)
                props.setLoading(false);
            }
            catch (error) {
                props.handleErrors(error)
            }
        }
        if (props.user.role === 'ADMIN') {
            initUsernames()
        }
    }, [])

    const handleStateChange = (newState, key) => {
        setCardBody((prevBody) => {
            const updatedBody = [...prevBody];
            const idx = updatedBody.findIndex(element => element.key === key);
            updatedBody[idx].value = newState
            return updatedBody
        })
    }

    const deleteElement = async (id) => {
        setCardBody((prevBody) => {
            const updatedBody = [...prevBody];
            const idx = updatedBody.findIndex(element => element.id === id)
            updatedBody.splice(idx, 1)
            return updatedBody;
        });
    };

    function moveElement(index, direction) {
        if (index === 0 && direction === -1 || index === cardBody.length && direction === +1) return;

        const updatedArray = moveContents(cardBody, index, index + direction);
        setCardBody(updatedArray);
    }

    function addBlockGroup(component, image = '') {
        setKeys(keys+1)
        setCardBody((prev) => [
            ...prev,
            {
                oldid: null,
                key: `n-component#${keys}`,
                id: `component#${cardBody.length}`,
                type: `${component}`,
                value: '',
                img: image
            }
        ]);
    }

    function selectImage(img) {
        addBlockGroup('Image', img)
    }

    async function handleSubmit(event) {
        event.preventDefault();

        //if page not passed --> page creation
        const obj = { id: null }

        obj['id'] = page !== undefined ? page.id : null;
        obj['author'] = page === undefined ? props.user.id : author.id;
        obj['title'] = title;
        obj['creationDate'] = creationDate;
        obj['publicationDate'] = publicationDate ? publicationDate : null;
        obj['contents'] = cardBody.map((e, index) => {
            let content = ''
            if(e.type === 'Image') content = e.img.img;
            else if(e.type === 'Header' || e.type === 'Paragraph') content = e.value; 
            return {
                id: e.oldid !== undefined ? e.oldid : null,
                type: e.type === 'Header' && 1 || e.type === 'Paragraph' && 2 || e.type === 'Image' && 3,
                content: content,
                position: index,
                pageid: page !== undefined ? page.id : null,
            }
        })

        if (!obj.title || obj.title.trim() === '') {
            props.setMessage('Title cannot be an empty string!')
            props.setErrorAlert(true)
            //setShowAlert(true);
            setModalSubmitted(false)
            return;
        }

        const contentTypes = obj.contents.map(e => { return e.type })
        if (!(contentTypes.includes(1) && (contentTypes.includes(2) || contentTypes.includes(3)))) {
            props.setMessage('The body of the page must contain at least an Header and one between Paragraph and Image!')
            props.setErrorAlert(true)
            //setShowAlert(true);
            setModalSubmitted(false)
            return;
        }

        if (!obj.contents.every(item => item.content && item.content.trim())) {
            props.setMessage('The body of the page contains one or more empty elements!')
            props.setErrorAlert(true)
            //setShowAlert(true);
            setModalSubmitted(false)
            return;
        }

        if (page === undefined) {
            try {
                const retrievedSavedPage = await API.savePage(obj)
                setSubmittedPage(retrievedSavedPage)
                const pages = await API.listPages()
                props.setPages(pages)
                setModalSubmitted(true)
            } catch (error) {
                props.handleErrors(error)
            }

        } else {
            try {
                const retrievedSavedPage = await API.updatePage(obj)
                setSubmittedPage(retrievedSavedPage)
                const pages = await API.listPages()
                props.setPages(pages)
                setModalSubmitted(true)
            } catch (error) {
                props.handleErrors(error)
            }
            //setModal in an async fun does not make the modal appear, but i used the value in modal to reset itself just because it is useless to add another variable
        }
    }

    return (
        <Container className="d-grid gap-3 ">
           
            <TwoButtonsModal modal={{
                state: modalSubmitted,
                setModal: setModalSubmitted,
                title: 'Page created!',
                body: 'Check the page or go back to the previous page.',
                button1: 'Back to the previous',
                button2: 'Check this one!'
            }} furtherAction1={() => navigate('/backoffice')}
                furtherAction2={() => {
                    navigate('/backoffice/page', { state: { page: submittedPage } })
                }} />


            <Row className='d-flex justify-content-between align-items-center'>
                <Col sm='auto'><BackButton back={'/backoffice'} /></Col>
                <Col sm='auto'><CancelButton back={-1} /></Col>
                <Col>{(page !== undefined) ? <h2>Edit page</h2> : <h2>Create page</h2>}</Col>
            </Row>

            <div>
                <Card>
                    <Form className="d-grid gap-3" onSubmit={(e) => {
                        handleSubmit(e);
                        modalSubmitted ? setModalSubmitted(modalSubmitted) : setModalSubmitted(modalSubmitted)
                    }}>
                        <Card.Header>
                            <Row className='d-flex justify-content-between align-items-center '>
                                <Col>Creation Date: {creationDate}</Col>
                                <Col sm='auto'>
                                    <Button className='button-primary-color' variant="primary" type="submit">
                                        {page === undefined ? "Create page" : "Edit page"}
                                    </Button>
                                </Col>
                            </Row>

                            {props.user.role === 'ADMIN' && page !== undefined &&
                                <Row>
                                    <Card.Text as='div'>
                                        <span>Author:</span>
                                        <DropdownButton
                                            className="d-inline-block ddbutton-secondary-color ms-3"
                                            title={author.username}>
                                            {authors.map((user) => {
                                                return (
                                                    <NavDropdown.Item
                                                        key={user.id}
                                                        onClick={() => {
                                                            setAuthor({ id: user.id, username: user.username });
                                                        }}
                                                    >
                                                        {user.username}
                                                    </NavDropdown.Item>
                                                );
                                            })}
                                        </DropdownButton>

                                    </Card.Text>
                                </Row>

                            }
                        </Card.Header>

                        <div className="d-grid gap-3">
                            <Card.Body className="d-grid gap-3">
                                <Card.Title>
                                    <Form.Text>Title</Form.Text>
                                    <Form.Control id='title' type='text' value={title || ''} onChange={(e) => { setTitle(e.target.value) }} />
                                </Card.Title>

                                <Form.Group as={InputGroup}>
                                    <InputGroup.Text>Publication Date</InputGroup.Text>
                                    <Form.Control type="date" value={publicationDate ? publicationDate : ''} onChange={event => setPublicationDate(event.target.value)} />
                                </Form.Group>

                                {cardBody.map(({ key, id, oldid, type, value, img }, index) => (
                                    <BlockGroup key={key} idkey={key}
                                        oldid={oldid} id={id}
                                        img={img} index={index}
                                        type={type} value={value}
                                        moveElement={moveElement} deleteElement={deleteElement}
                                        modal={modalDeleteElement} setModal={setModalDeleteElement}
                                        onStateChange={handleStateChange} />))}
                            </Card.Body>
                        </div>

                        <Card.Footer>
                            <Button sm='auto' className="me-3 button-secondary-color" onClick={() => { addBlockGroup('Header') }}>
                                add Header
                            </Button>
                            <Button sm='auto' className="me-3 button-secondary-color" onClick={() => { addBlockGroup('Paragraph') }}>
                                add Paragraph
                            </Button>
                            <DropdownButton className="d-inline-block ddbutton-secondary-color " title={'add Image'}>
                                <ImageSelecter selectImage={selectImage} />
                            </DropdownButton>
                        </Card.Footer>
                    </Form>
                </Card >
            </div>
        </Container >
    );
}
export { PageForm }