import pandas as pd

df_location = pd.read_stata('./classifications_data/location.dta')
df_country_codes = df_location[['location_id', 'location_code']].astype({'location_id': int}, errors='raise')

folder_path = './dataverse_files/'
country_partner_sitc_4digit = 'country_partner_sitcproduct4digit_year_{}.csv'
country_partner_sitc_2digit = 'country_partner_sitcproduct2digit_year.csv'
country_partner_sitc_section = 'country_partner_sitcproductsection_year.csv'
country_sitc_2digit = 'country_sitcproduct2digit_year.csv'
country_sitc_4digit = 'country_sitcproduct4digit_year.csv'
country_sitc_section = 'country_sitcproductsection_year.csv'
sitc_2digit=2
sitc_4digit=4
years = range(1962, 2019+1)

def get_data(country_partner=True, sitc_digit=4, year=2019):
    """
    Creates a Dataframe for a specified SITC dataset

    Args:
        country_partner: If True, dataset with trades between countries and partners are selected
        sitc_digit: 4 for SITC-4 digit products, 2 for SITC-2 digit products, otw SITC product section
        year: Year between 1962 and 2019 for the country-partner SITC-4 digit products
    Returns:
        Dataframe of the selected dataset
    """
    path = folder_path
    if country_partner:
        if sitc_digit==sitc_4digit:
            path += country_partner_sitc_4digit.format(year)
        elif sitc_digit==sitc_2digit:
            path += country_partner_sitc_2digit
        else:
            path += country_partner_sitc_section
    else:
        if sitc_digit==sitc_4digit:
            path += country_sitc_4digit
        elif sitc_digit==sitc_2digit:
            path += country_sitc_2digit
        else:
            path += country_sitc_section

    return pd.read_csv(path)



def get_exports_imports(df_data):
    """
    Returns a dataframe with the summed exports and imports. Ordered by the descending export values

    Args:
        A dataframe containing the data
    Returns:
        A dataframe containing the ```location_id```, ```location_code```, ```total_trades```, ```export_value```, ```import_value```, ```percentage_exports``` and ```P
        percentage_imports```
    """
    df_exports_imports = df_data.groupby('location_id', as_index=False).agg({'export_value':'sum', 'import_value':'sum'}).sort_values('export_value', ascending=False)
    df_exports_imports = df_exports_imports.merge(df_country_codes, on='location_id')
    df_exports_imports.insert(1, 'location_code', df_exports_imports.pop('location_code'))
    df_exports_imports.insert(2, 'total_trades', df_exports_imports['export_value'] + df_exports_imports['import_value'])
    exports_sum = df_exports_imports['export_value'].sum()
    imports_sum = df_exports_imports['import_value'].sum()
    df_exports_imports['percentage_exports'] = df_exports_imports['export_value'] * 100 / exports_sum
    df_exports_imports['percentage_imports'] = df_exports_imports['import_value'] * 100 / imports_sum
    df_exports_imports['percentage_total'] = df_exports_imports['import_value'] * 100 / (exports_sum + imports_sum)

    return df_exports_imports


def get_highest_trading_countries(df_data):
    """
    Returns a dataframe with the summed value of the trades between countries. Ordered by the descending trade values

    Args:
        df_data: A dataframe containing the data
    Returns:
        A dataframe containing the ```location_id```, ```location_code```, ```export_value```, ```import_value```, ```Percentage_exports``` and ```Percentage_imports```
    """
    df_highest_partners = df_data.groupby(['location_id', 'partner_id'], as_index=False).agg({'export_value':'sum'})
    df_highest_partners = df_highest_partners.merge(df_country_codes, on='location_id')
    df_highest_partners = df_highest_partners.merge(df_country_codes.rename(columns = {'location_id':'partner_id'}), on='partner_id')


    df_highest_partners = df_highest_partners.sort_values('export_value', ascending=False)
    df_highest_partners.rename(columns = {'export_value':'value', 'location_code_x':'exporting_country', 'location_code_y':'importing_country'}, inplace = True)

    value_sum = df_highest_partners['value'].sum()
    df_highest_partners['percentage'] = df_highest_partners['value'] * 100 / value_sum
    return df_highest_partners


def contries_table_1962_2019():
    """
    Creates a pd.DataFrame containing trade statistics for all available years.

    The index column is ```location_code``` which represents each country with its 3 digit code (equivalent of the ```ISO_A3``` of the ```ne_110m_admin_0_countries.geojson``` file).
    Then for every year, there are 14 columns:
        ```export_value_{year}```: Total exported value in USD
        ```import_value_{year}```: Total imported value in USD
        ```total_trades_{year}```: Total of imported + exported value in USD
        ```percentage_exports_{year}```: Percentage of the exported value compared to the worldwide sum of exports
        ```percentage_imports_{year}```: Percentage of the imported value compared to the worldwide sum of imports
        ```percentage_total_{year}```: Percentage of total exported + imported value compared to worldwide exported + imported value
        ```highest_export_to_{year}```: 3-Digit country code of the country where the most exports were made to
        ```trade_value_exported_{year}```: Value of the exported trade to the the country where the most exports were made
        ```percentage_exp_all_trades_{year}```: Percentage of the exported trade value to the country where the most exports were made compared to all the trades made worlwide
        ```percentage_trade_to_exp_{year}```: Percentage of the exported trade value to the country where the most exports were made compared to the value of the exports made by the country
        ```highest_import_from_{year}```: 3-Digit country code of the country from which the most import were made
        ```trade_value_imported_{year}```: Value of the import trades from the country from which the most imports were made
        ```percentage_imp_all_trades_{year}```: Percentage of the value of the import trades from the country from which the most imports were made compared to all the trades made worldwide
        ```percentage_trade_to_imp_{year}```: Percentage of the value of the import trades from the country from which the most imports were made compared to the value of the imports made by the country
        
    Returns:
        The resulting pd.DataFrame of shape (258, 613)								
    """

    df_years = pd.DataFrame(df_location['location_code'])

    for year in years:
        # Get corresponding sitc_4 digit dataset
        df_data = get_data(year=year)

        df_exports_imports = get_exports_imports(df_data)

        df_highest_trades_exp = get_highest_trading_countries(df_data)

        df_year = df_exports_imports.merge(df_highest_trades_exp.groupby('location_id').first(), on='location_id')

        # Copy the df of the highest export trades and switch the column names to get the table with the highest import trades
        df_highest_trades_imp = df_highest_trades_exp.copy()
        df_highest_trades_imp.columns = ['partner_id', 'location_id', 'value', 'importing_country', 'exporting_country', 'percentage']

        df_year = df_year.merge(df_highest_trades_imp.groupby('location_id').first(), on='location_id')

        # Drop unused columns and rename the merged columns
        df_year = df_year.drop(['location_id', 'partner_id_x', 'exporting_country_x', 'partner_id_y', 'exporting_country_y'], axis=1)
        df_year = df_year.rename(columns={'value_x':'trade_value_exported', 'importing_country_x':'highest_export_to', 'percentage_x':'percentage_exp_all_trades', 
            'value_y':'trade_value_imported', 'importing_country_y':'highest_import_from', 'percentage_y':'percentage_imp_all_trades'})

        # Add columns for the percentage of the trades with the highest exporting/importing countries compared to the total exporting/importing value of the country
        df_year['percentage_trade_to_exp'] = df_year.trade_value_exported * 100 / df_year.export_value
        df_year['percentage_trade_to_imp'] = df_year.trade_value_imported * 100 / df_year.import_value

        # Move colomns 
        df_year.insert(5, 'highest_export_to', df_year.pop('highest_export_to'))
        df_year.insert(8, 'highest_import_from', df_year.pop('highest_import_from'))
        df_year.insert(8, 'percentage_trade_to_exp', df_year.pop('percentage_trade_to_exp'))

        # Change column names
        df_year.columns = [col + '_{}'.format(year) if col != 'location_code' else col for col in df_year.columns]

        # Concat with the other years
        df_years = pd.concat([df_years.set_index('location_code'), df_year.set_index('location_code')], axis=1).reset_index()

    # Replace NaNs by -1
    df_years.fillna(-1, inplace=True)

    return df_years


