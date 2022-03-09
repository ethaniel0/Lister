# TODO (in order of importance)

# List View
- Put completed tasks at the bottom

## Image Usage Detection
- increment count whenever an image is referenced
- decrement count if image is changed or list/account is deleted
- if the number of image references in the db = 0, delete image from collection and from storage

## Server
- store how many times saved
- more advanced password checks (common passwords, repeated characters, etc)

## List View
- save list
- increment # visits from different users (so no spam loading to increase view count)

## User Profiles
- distinguish between private and public users

## Register for a different plan
- make the page
- display options (personal, public)

## Settings Page
- send validation email address
- forgot password

## Browse
- ranking system
    - get second degree tags from the top 5 direct search results
    - weight the results from the second-degree tag search
    
- use algolia for name search

## Profile
- folders?

# Done

## List View

## Account Deletion
- delete account within settings page

## Browse
- extract direct tags from query
- search for all lists with similar names or with those direct tags
- weight results
- sort all lists
- send the lists to the user

## Server
- username requirements (username must be <= 20 characters>)
- password requirements (password must have >= 6 characters)
- tags functionality
- store how many times a list has been implemented and when (by the day, according to utc-0 ig)

## Profile
- only show private lists if you're logged in
- edit main picture
- make lists private or public

## List Editing
- tags functionality

## Browse Page
- header
- search bar

## Settings Page
- change top bar picture
- change password
- Change username
- change email
- change profile picture
- auto close the change username or change email after updating