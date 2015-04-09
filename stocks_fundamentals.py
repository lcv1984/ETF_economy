import os
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import datetime
from statsmodels.tsa.seasonal import seasonal_decompose
import seaborn as sns


def to_decimal_date(x):

    z = np.zeros(len(x))
    for i,date in enumerate(x):
        y = date.year
        m = date.month
        d = date.day
        z[i] = y + (m/12.) + (d/30.)

    return z

def get_etf_df():

    datapath = os.getenv('HOME')+'/repos/ETF_economy/data/'
    fname    = datapath+'ishares_country_data.csv'

    df = pd.read_csv(fname,sep=',',)

    #print first few columns
    print df.head(2)

    #get country for each row in DF by list comprehension
    countries = pd.Series([x.split()[2] for x in df['fund_name']])

    #Add countries column to DF.
    df['country'] = countries
    df.loc[df['country'] == 'All','country'] = "Peru"

    #Convert tickerdate to datetime and add to dataframe
    dates = pd.Series([datetime.datetime.strptime(x, '%m/%d/%Y').date() for x in df['tickerdate']])
    df['date'] = dates

    return df

def get_time_series_etf(df,etfname,type_return="index"):

#now plot one of index_total_return, nav_total_return, marketprice_total_return
#as function of time for a given country
    dfsub = df[df['country'] == etfname].sort('date',ascending=True)

    t = np.array(dfsub['date'])
    if type_return == "index":
        y = np.array(dfsub['index_total_return'])
    elif type_return == "nav":
        y = np.array(dfsub['nav_total_return'])
    elif type_return == "marketprice":
        y = np.array(dfsub['marketprice_total_return'])

    return (t,y)

def get_econ_data():

    datapath = os.getenv('HOME')+'/repos/ETF_economy/data/'
    fname1    = datapath+'wb_gdp_current.csv'
    fname2    = datapath+'wb_gdp_growth.csv'
    fname3    = datapath+'wb_inflation_annual.csv'

    df1 = pd.read_csv(fname1,sep=',',comment="#")
    df2 = pd.read_csv(fname2,sep=',',comment="#")
    df3 = pd.read_csv(fname3,sep=',',comment="#")
    df1.rename(columns=lambda x: x.strip())
    df2.rename(columns=lambda x: x.strip())
    df3.rename(columns=lambda x: x.strip())
    df1.rename(columns={'Country Name': 'country'},inplace=True)
    df2.rename(columns={'Country Name': 'country'},inplace=True)
    df3.rename(columns={'Country Name': 'country'},inplace=True)

    return (df1,df2,df3)

def get_time_series_econ(df,etfname,type_return="GDP growth (annual %)"):

#now plot one of index_total_return, nav_total_return, marketprice_total_return
#as function of time for a given country
    dfsub = df[(df['country'] == etfname) & (df.iloc[:,0] == type_return)]

    t = np.array(range(2000,2013))
    y = np.array(dfsub.iloc[:,4:])
    y = y[0]

    return (t,y)

def get_econ_indicators(df_econ,verbose=False):
    indicators = pd.unique(df_econ.ix[:,0])
    indicator_dict = {}
    for i,x in enumerate(indicators):
        indicator_dict[i] = x

    return indicator_dict

def compare_two_indicators(df_econ,country,indicators,norm=True,plot=False,idx=-1):
    if idx == -1:
        for i,x in indicators.items():
            print i,x
        col1 = int(raw_input('>Index for first indicator to compare:'))
        col2 = int(raw_input('>Index for first indicator to compare:'))
    elif len(idx) == 2:
        col1 = idx[0]
        col2 = idx[1]
    else:
        raise ValueError
    t1,y1 = get_time_series_econ(df_econ,country,indicators[col1])
    t2,y2 = get_time_series_econ(df_econ,country,indicators[col2])
    #now scale the two time series
    if norm == True:
        y1 = normalize_ts(y1)
        y2 = normalize_ts(y2)
    else:
        pass
    if plot == True:
        plt.plot(t1,y1,'bo',ls='-',lw=2)
        plt.plot(t2,y2,'ro',ls='-',lw=2)
        plt.show()
    else:
        pass
    #now scale the two time series
    return (t1,y1,y2,squared_distance(y1,y2))

def normalize_ts(y):
    return (y - min(y))/(max(y) - min(y))

def squared_distance(y1,y2):
    #returns sum of squared distances between two time series,
    #after pruning nans
    mask = np.isfinite( y1-y2 )
    delta = y1[mask] - y2[mask]
    if len(delta) >= 1:
        return len(delta),np.sqrt(np.sum(delta**2))
    else:
        return 0,-1

#get stock data
etfs     = get_etf_df()
country  = 'Japan'

#get economy data
gdp_cur, gdp_growth, inflation = get_econ_data()

wb_indicators = get_econ_indicators(gdp_cur,verbose=True)

#res = compare_two_indicators(gdp_cur,country,wb_indicators,norm=True,plot=True)

#print res

t1, y1 = get_time_series_etf(etfs,country)
t1 = to_decimal_date(t1)
y1_quarter = pd.stats.moments.rolling_mean(y1,window=3)

t2, y2 = get_time_series_econ(gdp_cur,country)

for i in range(len(wb_indicators)):
    for j in range(i,len(wb_indicators)):
        t,y_i,y_j,res = compare_two_indicators(gdp_cur,country,wb_indicators,
            norm=True,plot=False,idx=[i,j])
        print i,',',j,',',res

#res = seasonal_decompose(y2s)

#print type(res)

plt.plot(t1,y1,'bo',ls='-',lw=2)
plt.plot(t1,y1_quarter,'gs',ls='-',lw=2)
plt.plot(t2,y2,'ro',ls='-',lw=2)
plt.show()
