const filterSpacesResolver = (Space) =>{
    return {
        Query:{
            getSpacesFiltered: async (_source, {modelIds, searchString, filterCategories, filterLevels, sort}) =>{
                let spaces = await Space.find({
                    where: {
                        Models: {
                            Id_IN: modelIds
                        }
                    }
                })
                console.log(spaces)                 
                

                if(filterCategories){
                    spaces = spaces.filter(x => filterCategories.includes(x.LatestTemplate.Id))
                }

                return spaces;
            }
        }
    }
}

module.exports = filterSpacesResolver;
