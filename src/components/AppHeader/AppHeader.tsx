import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { MOCK_CART } from "../../modules/mock";
import "./AppHeader.css";
import logo from "../../assets/logo.png";

export default function AppHeader() {
  return (
    <header>
      <Navbar
        expand="lg"
        collapseOnSelect
        variant="dark"
        className="heat-navbar py-0"
        data-bs-theme="dark"
      >
        <Container fluid className="heat-navbar__inner">
          <Navbar.Brand as={Link} to="/" className="header-home mb-0 py-2">
            <span className="header-home__text"></span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="heat-main-nav" className="heat-navbar__toggle" />
          <Navbar.Collapse id="heat-main-nav">
            <Nav className="mx-auto mb-2 mb-lg-0 heat-navbar__nav" navbar>
              <Nav.Link as={Link} to="/" className="app-header__navbar" eventKey="catalog">
                <img src={logo} alt="Логотип" className="header-logo" />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
