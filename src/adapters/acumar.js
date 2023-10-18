'use strict';

import got from 'got';
import { load } from 'cheerio';
import { DateTime } from 'luxon';
import log from '../lib/logger.js';

const stations = [
  {
    station: 'EMC I Dock Sud',
    table: 0,
    coordinates: { latitude: -34.667375, longitude: -58.329231 },
    url: 'http://jmb.acumar.gov.ar/calidad/contaminantes.php',
  },
  {
    station: 'EMC II La Matanza',
    table: 0,
    coordinates: { latitude: -34.883175, longitude: -58.682542 },
    url: 'http://jmb.acumar.gov.ar/calidad/contaminantesEmcII.php',
  },
];

let offset;

export const name = 'acumar';

export async function fetchData (source, cb) {
	try {
		if (source.datetime) {
			log.debug(`Fetching data with ${source.datetime}`);
			const dateLuxon = source.datetime.toFormat('dd/MM/yy');
			const hourLuxon = source.datetime.toFormat('HH');

      const results = await Promise.all(
        stations.map((station) =>
          getPollutionData(station, dateLuxon, hourLuxon, 1)
        )
      );

      const flattenedResults = results.flat();

      cb(null, {
        name: 'unused',
        measurements: flattenedResults,
      });
    } else {
      offset = 1;

      const results = await Promise.all(
        stations.map((station) =>
          getPollutionData(station, null, null, 3)
        )
      );

      const flattenedResults = results.flat();
      cb(null, {
        name: 'unused',
        measurements: flattenedResults,
      });
    }
  } catch (error) {
    log.error(`Error fetching data: ${error.message}`);
    cb(error);
  }
}

async function getPollutionData (
  station,
  dateLuxon,
  hourLuxon,
  numRows
) {
  const pollutantParams = [
    'no2',
    'no',
    'nox',
    'o3',
    'pm10',
    'pm25',
    'so2',
    'co',
  ];
  let results = [];

  try {
    const response = await got(station.url, {
      timeout: {
        request: 5000,
        connect: 1000,
        secureConnect: 1000,
        socket: 5000,
        response: 5000,
        send: 1000,
      },
    });
    const $ = load(response.body);

    if (dateLuxon && hourLuxon) {
<<<<<<< HEAD
				log.debug(`Checking for data: ${dateLuxon}, ${hourLuxon}`);
      firstDataRow = $('table')
=======
      const firstDataRowIndex = $('table')
>>>>>>> b2f175dd5c954b41efe54f5765bd432930a53dd0
        .eq(station.table)
        .find('tr')
        .get()
        .findIndex((row) => {
          const dateCell = $(row).find('td').eq(0).text().trim();
          const hourCell = $(row)
            .find('td')
            .eq(1)
            .text()
            .trim()
            .replace(' hs.', '');
          return dateCell === dateLuxon && hourCell === hourLuxon;
<<<<<<< HEAD
        })
        .first();
    } else {
				log.warn(`Could not match date and hour: ${dateLuxon}, ${hourLuxon}`);
      firstDataRow = $('table')
=======
        });

      const timeRows = $('table')
>>>>>>> b2f175dd5c954b41efe54f5765bd432930a53dd0
        .eq(station.table)
        .find('tr')
        .slice(firstDataRowIndex, firstDataRowIndex + numRows);

<<<<<<< HEAD
    const dateStr = firstDataRow.find('td').eq(0).text().trim();
    const timeStr = firstDataRow
      .find('td')
      .eq(1)
      .text()
      .trim()
      .replace(' hs.', '');
    const localDate = DateTime.fromFormat(
      `${dateStr} ${timeStr}`,
      'dd/MM/yy H',
      { zone: 'America/Argentina/Buenos_Aires' }
    );
    const utcDate = localDate.toUTC();

    pollutantParams.forEach((param, index) => {
      const value = parseFloat(
        firstDataRow
          .find('td')
          .eq(index + 2)
          .text()
          .trim()
      );


      results.push({
        city: 'Buenos Aires',
        location: station.station,
        parameter: param,
        value,
        unit: param === 'co' ? 'mg/m³' : 'µg/m³',
        date: {
          local: localDate.toISO({ suppressMilliseconds: true }),
          utc: utcDate.toISO({ suppressMilliseconds: true }),
        },
        coordinates: station.coordinates,
        attribution: [
          {
            name: 'ACUMAR',
            url: station.url,
          },
        ],
        averagingPeriod: {
          unit: 'hours',
          value: 1,
        },
=======
      timeRows.each((_, row) => {
        processRow($, row, station, pollutantParams, results);
>>>>>>> b2f175dd5c954b41efe54f5765bd432930a53dd0
      });
    } else {
      const recentRows = $('table')
        .eq(station.table)
        .find('tr')
        .slice(offset, offset + numRows);

      recentRows.each((_, row) => {
        processRow($, row, station, pollutantParams, results);
      });
    }
  } catch (error) {
    log.error(`Error fetching data: ${error.message}`);
  }

  results = results.filter((m) => m.value !== 0 && !isNaN(m.value));
  return results;
}

function processRow ($, row, station, pollutantParams, results) {
  const dateStr = $(row).find('td').eq(0).text().trim();
  const timeStr = $(row)
    .find('td')
    .eq(1)
    .text()
    .trim()
    .replace(' hs.', '');
  const localDate = DateTime.fromFormat(
    `${dateStr} ${timeStr}`,
    'dd/MM/yy H',
    { zone: 'America/Argentina/Buenos_Aires' }
  );
  const utcDate = localDate.toUTC();

  pollutantParams.forEach((param, index) => {
    const value = parseFloat(
      $(row)
        .find('td')
        .eq(index + 2)
        .text()
        .trim()
    );

    results.push({
      city: 'Buenos Aires',
      location: station.station,
      parameter: param,
      value,
      unit: param === 'co' ? 'mg/m³' : 'µg/m³',
      date: {
        local: localDate.toISO({ suppressMilliseconds: true }),
        utc: utcDate.toISO({ suppressMilliseconds: true }),
      },
      coordinates: station.coordinates,
      attribution: [
        {
          name: 'ACUMAR',
          url: station.url,
        },
      ],
      averagingPeriod: {
        unit: 'hours',
        value: 1,
      },
    });
  });
}
