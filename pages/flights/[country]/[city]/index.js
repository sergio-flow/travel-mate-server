import React, { useEffect } from 'react';
import InfiniteScroll from "react-infinite-scroller";
import moment from 'moment';
import { slugify } from '../../../../utils/slugify';

export default function City({ country, city }) {
    const [week, setWeek] = React.useState(1);
    const [dayFrom, setDayFrom] = React.useState(6);
    const [dayTo, setDayTo] = React.useState(7);
    const [flights, setFlights] = React.useState([]);
    const [priceLte, setPriceLte] = React.useState(200);
    const [hasMore, setHasMore] = React.useState(true);


    useEffect(() => {
        // fetchData()
    }, [])

    const fetchData = async () => {
        const response = await fetch(
            `/api/search-flights?country=${country}&city=${city}&week=${week}&dayFrom=${dayFrom}&dayTo=${dayTo}&priceLte=${priceLte}`
        );
        const data = await response.json()

        setFlights([...flights, ...data.flights]);
        setWeek(week + 1);

        if (week >= 9) {
            setHasMore(false)
        }
    };

    // ✈️ 15:40 Fri, 08/03 | 🏠 15:40 Sat, 09/03

    return (
        <div className='page page-city'>
            <InfiniteScroll
                className='grid-cards'
                pageStart={0}
                loadMore={fetchData}
                hasMore={hasMore}
                loader={
                    <div className="loader" key={0}>
                        Loading ...
                    </div>
                }
            >
                {flights.map((item, index) => {
                    const cityTo = item['route'][0]['cityTo'];
                    const countryTo = item['countryTo']['name'];
                    const image = `/cities/${slugify(countryTo)}/${slugify(cityTo)}.jpg`

                    return (
                        <a className='card' href={item.deep_link} key={index} target='_blank' rel={'follow'}>
                            <div className='city-to'>{cityTo}</div>
                            <div className='country-to'>{countryTo}</div>

                            <div className='bottom-left'>
                                <div>✈️ {moment(item['route'][0]['local_departure']).format("HH:mm ddd, MM/DD")}</div>
                                <div>🏠 {moment(item['route'][1]['local_arrival']).format("HH:mm ddd, MM/DD")}</div>
                            </div>

                            <div className='bottom-right'>&euro;{item['price']}</div>

                            <img src={encodeURI(image)} alt={`${cityTo}, ${item['countryTo']['name']} | citybreak.pro`} />
                        </a>
                    )
                })}
            </InfiniteScroll>
        </div>
    )
}

export async function getServerSideProps(context) {
    const { country, city } = context.params;

    return { props: { country, city } }
}

const fetchFlights = (country, city) => new Promise((resolve, reject) => {
    fetch(`${process.env.NEXT_PUBLIC_PUBLIC_BASE_URL}/api/search-city?country=${country}&city=${city}`, { next: { revalidate: 60 } })
        .then((response) => response.json())
        .then((data) => {
            resolve(data);
        })
        .catch((err) => reject(err));
});
