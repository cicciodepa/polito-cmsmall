import { Alert } from "react-bootstrap";

function AlertError(props){

    return(
        <Alert variant='danger' onClose={props.handleAlertClose} dismissible>
            {props.message}
        </Alert>
    )
}

export default AlertError;