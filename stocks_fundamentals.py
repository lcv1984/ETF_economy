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

def get_time_series(df,etfname,type_return="index"):

#now plot one of index_total_return, nav_total_return, marketprice_total_return
#as function of time for a given country
    dfsub = df[df['country'] == etfname].sort('date',ascending=True)

    x = np.array(dfsub['date'])
    if type_return == "index":
        y = np.array(dfsub['index_total_return'])
    elif type_return == "nav":
        y = np.array(dfsub['nav_total_return']) 
    elif type_return == "marketprice":
        y = np.array(dfsub['marketprice_total_return'])

    return (x,y)

#get stock data
datapath = os.getenv('HOME')+'/repos/ETF_economy/data/'
fname    = datapath+'ishares_country_data.csv'
etfs     = get_etf_df(fname)

print pd.unique(etfs['country'])

t, y = get_time_series(etfs,'Chile')

plt.plot(t,y)
plt.show()
