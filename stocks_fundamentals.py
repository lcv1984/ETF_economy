import os
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import datetime

def get_etf_df(fname):

    df = pd.read_csv(fname,sep=',',)

    #print first few columns
    print df.head(5)

    #get country for each row in DF by list comprehension
    countries = pd.Series([x.split()[2] for x in df['fund_name']])
    print(type(countries))

    #Add countries column to DF.
    df['country'] = countries

    #Convert tickerdate to datetime and add to dataframe
    dates = pd.Series([datetime.datetime.strptime(x, '%m/%d/%Y') for x in df['tickerdate']])
    df['date'] = dates

    return df

def get_time_series(df,etfname):

#print list of unique countries
print pd.unique(etfs['country'])

#now plot one of index_total_return, nav_total_return, marketprice_total_return
#as function of time for a given country
country = 'Japan'

dfsub = stocks[stocks['country'] == country].sort('date',ascending=True)

print dfsub.head(5)

x = np.array(dfsub['date'])
y = np.array(dfsub['index_total_return'])

datapath = os.getenv('HOME')+'/repos/stockindexcountry/data/'

#get stock data

stocks = pd.read_csv(datapath+'ishares_country_data.csv',sep=',',)

plt.plot(x,y)
plt.show()
