# Datalakes Website

React-App for searching, visualising and downloading data on Swiss lakes. Consists of a Web GIS for comparing raster and point datasets, Data Portal for selecting products and extensive options for graphing and downloading the products.

Datalakes is a collaboration between a number of Swiss institutions to facilitate the visualisation and dissemination of reproducable datasets for Swiss lakes.

[www.datalakes-eawag.ch](https://www.datalakes-eawag.ch/)

![Home Page](https://runnalls.s3.eu-central-1.amazonaws.com/datalakes-home.png)

## Custom Deployment

The datalakes front-end is all completely open-source and available for deployment for other data projects. 

Developers will need to adjust the [config file](https://github.com/Datalakes-Eawag/datalakes-react/blob/master/config.json) to point to their own backend. The backend for the Datalakes website can be found [here](https://github.com/Datalakes-Eawag/datalakes-nodejs).