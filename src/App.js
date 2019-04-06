import React, { Component } from 'react';
import './App.css';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

const queryListCities = `
  query list {
    listCitys {
      items {
        id name description
      }
    }
  }
`

const queryCreateCity = `
  mutation($name : String! $description: String){
    createCity(input: {
      name: $name description: $description
    }) {
      id name description
    }
  }
`

const querySubscribeToCities = `
  subscription {
    onCreateCity {
      id name description
    }
  }
`

class App extends Component {
  state = { 
    cities: [],
    name: '',
    description: ''
  }
  
  subscriptionToCities = ''

  onChanage = e => {
    this.setState({
      [e.target.name] : e.target.value
    })
  } 

  async componentDidMount() {
    // Retrieve Data
    const cities = await API.graphql(graphqlOperation(queryListCities))
    this.setState({ cities: cities.data.listCitys.items })

    // subscribe to adds
    this.subscriptionToCities = API.graphql(graphqlOperation(querySubscribeToCities)).subscribe({
      next: (cityData) => {
        const city = cityData.value.data.onCreateCity
        const cities = [...this.state.cities.filter(i => {
            return (i.name !== city.name && i.description !== city.description)
            }), city]
        this.setState({ cities: cities }) 
      }
    })
  }

  componentWillUnmount() {
    this.subscriptionToCities.unsubscribe()
  }
  
  createCity = async () => {
    const city = { name: this.state.name, description: this.state.description }
    try {
      if ((this.state.city === '') || (this.state.description === '')) return
      const cities = [...this.state.cities, city]
      // add state locally, clear out form fields, and submit to API
      this.setState({ cities: cities, name: '', description: '' })
      await API.graphql(graphqlOperation(queryCreateCity, city))
    } catch (error) {
      console.log(error)      
    }
  }

  render() {
    return (
      <div className="App">
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <input 
            value={this.state.name}
            name='name' 
            onChange={this.onChanage} 
            style={{ height: 35, margin: 10 }} 
          />
          <input 
            value={this.state.description}
            name='description' 
            onChange={this.onChanage} 
            style={{ height: 35, margin: 10 }} 
          />
          <button onClick={this.createCity}>Create City</button>
        </div>
        {
          this.state.cities.map((c, i) => (
            <div key={i}>
              <p>{c.name} ({c.description})</p>
            </div>
          ))
        }
        </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
