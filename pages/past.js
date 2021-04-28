import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {ItemsContainer, ItemsHeader, CardContainer} from './index.styles'
import moment from 'moment'
import EditItem from './[id]/edit_order';
import { Button, Card, Modal } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckSquare } from '@fortawesome/free-solid-svg-icons'

const PastOrders = () => {
    const [orders, setOrders] = useState();
    const [items, setItems] = useState();
    const [products, setProducts] = useState();
    const [specialProduct, setSpecialProduct] = useState();
    const [todaysOrder, setTodaysOrder] = useState();
    const today = new Date();
    const todaysDate = () => convertDate(today)
    const router = useRouter();

    useEffect(() => {
        axios({
            "method": "GET",
            "url": "http://localhost:1337/products"
        })
        .then((response) => {
            setProducts(response.data)
        })
    }, []);

    useEffect(() => {
        axios({
            "method": "GET",
            "url": "http://localhost:1337/orders"
        })
        .then((response) => {
            setOrders(response.data)
        })
    }, []);

    const convertToDate = (stringFromData, short) => {
        const splitTime = stringFromData.split("T");
        const dateArray = splitTime[0].split("-");
        const timeArray = splitTime[1].split(':');
    
        const year = dateArray[0];
        const month = parseInt(dateArray[1]);
        const day = dateArray[2];
    
        const hour = timeArray[0];
        const minute = timeArray[1];
        const second = timeArray[2].split("Z")[0];
    
        if (short) {
            const finalMonth = month < 10 ? `0${month}` : month;
            const dateString = finalMonth + "/" + day + "/" + year;
            return dateString;
        } else {
            const dateObj = new Date(Date.UTC(year, month, day, hour, minute, second, 0));
            return dateObj;
        }
    };

    const convertDate = (date) => {
        var momentDate = moment(date).format('L');
        return momentDate;
    };

    const handleDelete = (id) => {
        axios({
            "method": "DELETE",
            "url": `http://localhost:1337/orders/${id}`
        })
        .then((response) => {
            console.log(response)
        }, () => {

        })
        refreshPage();
    };

    const handleSuccess = (productName, productQuantity, toDelete) => {
        products.map((x) => {
            if (x.name === productName) {
                setSpecialProduct(x)
            }
        })

        specialProduct ? 
        axios({
            "method": "PUT",
            "url": `http://localhost:1337/products/${specialProduct.id}`,
            "data": {
                qty: specialProduct.qty - productQuantity
            }
        })
        .then((response) => {
            console.log(response)
            handleDelete(toDelete)
        }) : null
    }

    function refreshPage() {
        window.location.reload(false);
      }

    return <>
        <ItemsContainer>
            <ItemsHeader>{todaysDate()}</ItemsHeader>
                {
                    orders ? orders.map((x) => {
                        const lastNightsOrder = convertToDate(x.date, true)
                        const todaysDate = convertDate(today)
                        
                        if (lastNightsOrder === todaysDate) {
                            return <>
                            <CardContainer>
                                <Card.Group>
                                    <Card style={{alignItems: 'center'}}>
                                        <Card.Content extra description={`${x.name} - ${x.qty}`}/>
                                        <Card.Content extra>
                                                <Button 
                                                    size="tiny" 
                                                    color="red"
                                                    onClick={() => handleDelete(x.id)}
                                                ><FontAwesomeIcon  icon={faTrash}/></Button>
                                                <Button 
                                                    size="tiny" 
                                                    color="green"
                                                    onClick={() => handleSuccess(x.name, x.qty, x.id)}
                                                ><FontAwesomeIcon icon={faCheckSquare}/></Button> 
                                        </Card.Content>
                                    </Card>
                                </Card.Group> 
                            </CardContainer>        
                            </>
                        }
                    }): null
                }
        </ItemsContainer>
    </>
};

export default PastOrders;