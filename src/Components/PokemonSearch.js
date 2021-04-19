import React, { Component } from "react";
import '../pokemon.css';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Modal, ModalBody, ModalFooter, Button, ModalHeader, Table } from 'reactstrap';

const BaseUrl = "http://localhost:40451/pokemon/";

class Pokemon extends Component {

    ButtonOnTbale = (cell, row) => {
        if (row.name) {
            return (
                <div>
                    <Button color="success" onClick={() => { this.getDetails(row.name) }}>Obtener detalles</Button>
                </div>
            );
        }
    }

    LinkColumn = (cell, row) => {
        if (row.name) {
            return (
                <a href={row.url} target="_blank">{row.url}</a>
            );
        }
    }

    state = {
        data: [],
        search: '',
        details: [],
        showModal: false,
        columns: [
            { dataField: "name", text: "Pokemon" },
            { dataField: "url", text: "Link Directo", formatter: this.LinkColumn },
            { text: "Detalles", formatter: this.ButtonOnTbale }
        ]
    };

    getPokemons = () => {
        axios.get(BaseUrl)
            .then((response) => {
                let options = response.data.results.map((pokemon) => ({
                    name: pokemon.name,
                    url: pokemon.url
                }));
                this.setState({ data: options, searchArray: options });
            })
            .catch((error) => {
                console.log(error.message);
            });
    }

    handleClose = () => {
        this.setState({ showModal: false });
    }


    detailsModal = () => {
        this.setState({ showModal: !this.state.showModal });
    }

    getDetails = (pokemon) => {
        var toArray = [];
        var imgArray = [];
        axios.get(BaseUrl + pokemon)
            .then((response) => {
                toArray.push(response.data);
                imgArray.push(response.data.sprites);
                let options = toArray.map((pokemon) => ({
                    id: pokemon.id,
                    name: pokemon.name,
                    height: pokemon.height,
                    weight: pokemon.weight,
                    experience: pokemon.base_experience,
                    type: pokemon.types[0].type.name,
                    img: imgArray[0].front_default
                }));
                this.setState({ details: options }, this.detailsModal)
            })
            .catch((error) => {
                console.log(error.message);
            });
    }

    handleInputChange = (e) => {
        console.log(e.target.value);
        this.setState({ search: e.target.value });
    };

    componentDidMount() {
        this.getPokemons();
    }

    downloadTxtFile = () => {
        const element = document.createElement("a");
        const Rawdata = this.state.details.map((datos) => ({
            id: datos.id,
            nombre: datos.name,
            Tipo: datos.type,
            Altura: Math.round(datos.height * 3.9)+ "pulgadas.",
            Peso: Math.round(datos.weight / 4.3)+ "libras.",
            Url_de_imagen: datos.img
        }));
        const datos = JSON.stringify(Rawdata);
        const modifiedString = datos.slice(2, -2).split(",").join("\n");
        const file = new Blob([modifiedString], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "Pokemon.txt";
        element.click();
      }

    render() {
        return (
            <div className="container">
                {/* Creating the heading */}
                <div>
                <img src="https://pngimg.com/uploads/pokeball/pokeball_PNG19.png" className="pokeball"></img>
                <h2 className="heading"> POKEDEX</h2>
                </div>
                {/* Creating Search Input */}
                <label className="search-label" htmlFor="search-input">
                    <input
                        type="text"
                        name="query"
                        id="search-input"
                        placeholder="Buscar Pokemon"
                        value={this.state.value}
                        onChange={this.handleInputChange}
                    />
                    <i className="fa fa-search search-icon" aria-hidden="true" />
                </label>
                {/* Render the results */}
                <BootstrapTable
                    keyField="name"
                    data={this.state.data.filter((value) => {
                        if (this.state.search == '') {
                            return value
                        } else if (value.name.toLowerCase().includes(this.state.search.toLowerCase())) {
                            return value
                        }
                    })}
                    columns={this.state.columns}
                    striped
                    hover
                    pagination={paginationFactory()}
                />
                {/* Creating the Details Modal */}
                <Modal isOpen={this.state.showModal} className="md">
                    <ModalHeader>Detalles para: {this.state.details.map((pokemon) => {return(<label>{pokemon.name}</label>)})}</ModalHeader>
                    {this.state.details.map((pokemon) => {return(<img src={pokemon.img} className="imagen"></img>)})}
                    <ModalBody>
                        <div className="container">
                            <Table className="table">
                                <thead>
                                    <tr>
                                        <th>id</th>
                                        <th>nombre</th>
                                        <th>Tipo</th>
                                        <th>Altura</th>
                                        <th>Peso</th>
                                        <th>Exp.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.details.map((pokemon) => {
                                        return (
                                            <tr key={pokemon.id}>
                                                <td>{pokemon.id}</td>
                                                <td>{pokemon.name}</td>
                                                <td>{pokemon.type}</td>
                                                <td>{Math.round(pokemon.height * 3.9)} "</td>
                                                <td>{Math.round(pokemon.weight / 4.3)} Lbs</td>
                                                <td>{pokemon.experience}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.downloadTxtFile}>Descargar detalles</Button>{' '}
                        <Button color="danger" onClick={this.handleClose}>Cancelar</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default Pokemon