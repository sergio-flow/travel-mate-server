import React from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import overview from '../utils/overview';
import { slugify } from '../utils/slugify';

import Link from 'next/link';

export default function Home() {
  const [isReady, setIsReady] = React.useState(false);
  const [ipInfo, setIpInfo] = useLocalStorage('ipInfo', {});

  React.useEffect(() => {
    setTimeout(() => setIsReady(true), 1250);
  }, []);

  React.useEffect(() => {
    if (isReady && (!ipInfo || !Object.keys(ipInfo).length)) {
      getIpInfo()
        .then((ipInfo) => setIpInfo(ipInfo))
        .catch((error) => console.error(error));
    }
  }, [isReady, ipInfo]);

  if (!isReady) {
    return <BrandedOverlay />
  }

  return (
    <div className='page page-cities'>
      {Object.entries(overview).map((item, countryIndex) => (
        <div className='country-cities' key={countryIndex}>
          <h5 className='country-name'>{item[0]}</h5>
          <div className='grid-cards'>
            {Object.entries(item[1]).map((city, cityIndex) => {
              const path = `${slugify(item[0])}/${slugify(city[0])}`
              const href = encodeURI(`/flights/${path}`)

              return (
                <Link className='card' href={href} key={`${countryIndex}-${cityIndex}`}>
                  <div className='city-from'>{city[0]}</div>
                  <img src={encodeURI(`/cities/${path}.jpg`)} alt={`${city[0]}, ${item[0]} | citybreak.pro`} />
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const BrandedOverlay = () => {
  return (
    <div className="branded-overlay">
      <img
        src="/logo.png"
        width={80}
        height={80}
        alt="citybreak.pro - Find a cheap city break"
      />
    </div>
  );
};

const getIpInfo = () => new Promise((resolve, reject) => {
  fetch(`https://ipinfo.io?token=${process.env.NEXT_PUBLIC_IP_INFO_TOKEN}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.error) {
        resolve(data);
      } else {
        reject(new Error(data.error));
      }
    })
    .catch((err) => reject(err));
});
