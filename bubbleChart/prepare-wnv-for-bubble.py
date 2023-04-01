
#pip install -U pandasql


import pandas as pd
from pandasql import *
import json
pd.set_option('display.max_columns', None)

df = pd.read_csv("data_wnv.csv")
df_collection = {}

year = list(range(2000,2022))
temp = year[0]

for i in year:
    print(i)
    #split dataset into yearly partitions
    df_collection[i] = sqldf("SELECT df.* FROM df WHERE year LIKE {};".format(i))
    
    #eliminate counties. only keep bug count per state
    df2 =df_collection[i]
    c = sqldf("SELECT YEAR, STATE, name, sum(count) as total FROM df2 GROUP BY State, name")

    #write table as json for every year
    exportJson = c.to_json(orient="records")
    f = open("%s.json" % i, 'w')
    f.writelines(exportJson)

