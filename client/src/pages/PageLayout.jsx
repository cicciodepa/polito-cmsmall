import { React,  useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link, useNavigate,  Outlet } from "react-router-dom";
import { FormModal } from '../components/Modals';

import { LoginForm } from "../components/Auth.jsx";

import API from '../API'

import 'bootstrap/dist/css/bootstrap.min.css';
import AlertError from "../components/AlertError";

function DefaultLayout(props) {

  return (
    <Container className="vh-100 below-nav mt-5 mb-5">
      <Row>
      <AlertError message={props.message} setErrorAlert={props.setErrorAlert} />

      </Row>
      <Row>
        <Outlet />
      </Row>
    </Container>
  )

}

function NotFoundLayout(props) {
  return (
    <>
      <h2>This is not the route you are looking for!</h2>
      <Link to="/">
        <Button variant="primary">Go Home!</Button>
      </Link>
      <AlertError message={props.message} setErrorAlert={props.setErrorAlert} />

    </>
  );
}

function HomeLayout(props) {
  const navigate = useNavigate()

  return (
    <Container className="vh-100 below-nav mt-5 pt-5 mb-3">
      <div className="d-grid justify-content-center align-items-center gap-3">
        <Row >
          <h1>Content Management Small</h1>
        </Row >
        <Row className='d-flex justify-content-center align-items-center'>
          <Col sm='auto'>
            <Button className='button-primary-color' size="lg" onClick={() => {
              navigate("backoffice/")
            }}>Back Office</Button>
          </Col>
          <Col sm='auto'>
            <Button className='button-primary-color' size="lg" onClick={() => {
              navigate("frontoffice")
            }}>Front Office</Button>
          </Col>
        </Row>
        {props.errorAlert && <Row>
          <AlertError message={props.message} handleAlertClose={props.handleAlertClose} />
        </Row>}
      </div >
    </Container>
  )
}

function LoadingLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={4} bg="light" className="below-nav" id="left-sidebar"></Col>
      <Col md={8} className="below-nav">
        <h1>CMSmall is loading ...</h1>
      </Col>
    </Row>
  );
}

function LoginLayout(props) {
  return (
    <div>
      <Row className="vh-100">
      <Col md={12} className="below-nav">
        <LoginForm sitename={props.sitename} login={props.login} />
      </Col>
    </Row>
    {props.errorAlert && <Row>
          <AlertError message={props.message} handleAlertClose={props.handleAlertClose} />
        </Row>}
    </div>
  );
}

function BackOfficeLayout(props) {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState(props.sitename)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const site = await API.setWebsite(value)
      props.setSitename(site.website)
      setShow(false);
    } catch (error) {
      props.handleErrors(error)
    }
  }

  return (
    <Container className="vh-100 below-nav mt-3 mb-3">
      <div className="d-grid gap-3 mb-5">
        <FormModal modal={{
          state: show,
          setModal: setShow,
          title: 'Modify website name',
          formtext: 'Please, enter the new website name:',
          value: value,
          setValue: setValue,
          button1: 'Cancel',
          button2: 'Save!'
        }} handleSubmit={handleSubmit} />

        <Row className='ms-5'><Col><h1>Back Office</h1></Col></Row>
        <Row className='d-flex justify-content-between align-items-center  ms-5 me-5'>
          <Col >{props.sitename}</Col>
          {props.user.role === 'ADMIN' ? <Col sm='auto'><Button onClick={() => { setShow(true) }}>Edit site name</Button></Col> : null}
        </Row>
        {props.errorAlert && <Row>
          <AlertError message={props.message} handleAlertClose={props.handleAlertClose} />
        </Row>}
        <Outlet />
      </div >
    </Container>
  )
}

function FrontOfficeLayout(props) {
  return (
    <Container className="vh-100 below-nav mt-3 mb-3">
      <div className="d-grid gap-3 mb-5">
        <Row className='ms-5 me-5'>
          <h1>Front Office</h1>
        </Row>
        <Row className='ms-5 me-5'>
          <h2>{`${props.sitename}`}</h2>
        </Row>
        {props.errorAlert && <Row>
          <AlertError message={props.message} handleAlertClose={props.handleAlertClose} />
        </Row>}
        <Outlet />
      </div>
    </Container>
  )
}

export { DefaultLayout, NotFoundLayout, LoadingLayout, LoginLayout, HomeLayout, BackOfficeLayout, FrontOfficeLayout };
