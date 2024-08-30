import pandas as pd
from bs4 import BeautifulSoup as bsp
from selenium import webdriver
import requests
def getBoard(url):
    response = requests.get(url)
    if not response.ok:
        print(f"Server Responded with the Exit Code {response.status_code}")
    else:
        soup = bsp(response.text, 'html.parser')  
        return soup.find('section', class_ = 'community-section box-border p-[1rem] relative max-w-screen-m mx-auto')      
    
def ScrapeData(soup) -> list:
    subreddit = []
    
    # Find all relevant divs
    board = soup.find_all('div', class_='flex flex-col flex-grow items-start')
    
    # Ensure that board is not empty
    if board:
        for subreddits in board:
            # Find the <a> tag within each div
            a_tag = subreddits.find('a', href=True, class_='m-0 font-bold text-12 text-current truncate max-w-[11rem]')
            
            # Ensure that the <a> tag is found before trying to access its text
            if a_tag:
                subreddit.append(a_tag.text.strip()[2:])
    
    # Print and return the list
    print(subreddit)
    return subreddit



def main():
    names = list()
    for i in range(1, 100):
        url = f"https://www.reddit.com/best/communities/{i}"
        content = getBoard(url)
        print(i)
        names.extend(ScrapeData(content))
        

    df = pd.DataFrame(names, columns = ['Subreddits'])
    df.to_csv('Subreddits.csv')

if __name__ == "__main__":
    main()