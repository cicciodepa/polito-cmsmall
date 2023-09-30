import { Button } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom"

function BackButton(props) {
    const navigate = useNavigate();

    return (
        <Button className='ms-1 button-primary-color' onClick={() => navigate(props.back)}>
            <ArrowLeft className='me-1' /> Back
        </Button>
    )
}

function CancelButton(props) {
    const navigate = useNavigate();
    
    return (
        <Button className='ms-1 button-secondary-color' onClick={() => navigate(props.back)}>
           Cancel
        </Button>
    )
}

function ReadMoreButton(props) {
    const navigate = useNavigate();
    return (
        <Button className='ms-1 button-primary-color' onClick={(e) => { e.preventDefault();
            navigate('page', { state: { page: props.page, order: props.order } })
        }} >Read more...</Button>
    )
}

function EditButton(props) {
    const navigate = useNavigate();
    return (
        <Button className="button-secondary-color" sm='auto' onClick={() => {
            navigate('/backoffice/edit', { state: { page: props.page } })
        }}><i className="bi bi-pencil-square">{(props.text !== undefined ? props.text : null)}</i></Button>
    )
}

function DeleteButton(props) {
    return (
        <Button variant='danger' sm='auto' onClick={props.handleClick} >
            <i className="bi bi-trash">{(props.text !== undefined ? props.text : null)}</i>
        </Button >
    )
}

export { BackButton, CancelButton, ReadMoreButton, EditButton, DeleteButton }