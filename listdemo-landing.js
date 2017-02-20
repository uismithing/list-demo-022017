import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {connect} from "react-redux";
import {reduxForm} from "redux-form";
import {Link} from "react-router";
import {Panel, Button} from "react-bootstrap";
import {VelocityComponent, VelocityTransitionGroup, velocityHelpers} from "velocity-react";
import {VelocityAnimate, VelocityUi} from "velocity-animate";
import $ from "jquery";
//
import {fetchListdemoPopulationJson} from "../actions/actions";
import {updateState} from "../toolbox/toolbox";
//
class ListdemoLanding extends Component
{
	//*************************
	//*************************
	// Standard Methods
	//
	constructor(props)
	{
	    super(props);
	}
	getChildContext()
	{
		// empty
	}
	getInitialState()
	{
		return({});
	}
	componentWillMount()
	{
		this.props.fetchListdemoPopulationJson();
	}
	componentWillUnmount()
	{
		// empty
	}
	componentDidMount()
	{
		let scopeProxy
			= this;
		let setViewLoaded
			= this.context.setViewLoaded;
		let setLayoutMode
			= this.context.setLayoutMode;
		let navigationSection
			= 0;
		let updateNavigationState
			= this.context.updateNavigationState;
		//
		updateNavigationState(navigationSection);
		//
		let setviewTimeout =
			setTimeout(function()
			{
				setViewLoaded(true);
				setLayoutMode("full");
			},
			500);
		//
		updateState(scopeProxy,
		{
			"Ready":false,
			"Population":
			{
				"Original":null,
				"Searchable":null
			},
			"Results":
			{
				"Size":null,
				"Indexes":null,
				"Filtered":null
			}
		});
	}
	componentWillUpdate()
	{
		// empty
	}
	componentDidUpdate()
	{
		let scopeProxy
			= this;
		//
		window.requestAnimationFrame(function()
		{
			if(scopeProxy.props.listdemoPopulationJson !== null
			&& scopeProxy.state.Population.Original === null)
			{
				updateState(scopeProxy,
				{
					"Ready":false,
					"Population":
					{
						"Original":scopeProxy.props.listdemoPopulationJson,
						"Searchable":null
					},
					"Results":
					{
						"Size":null,
						"Indexes":null,
						"Filtered":null
					}
				});
				scopeProxy.establishSearchableList();
			}
			if(scopeProxy.state !== undefined
			&& scopeProxy.state.Ready === false)
			{
				updateState(scopeProxy,
				{
					"Ready":true
				});
			}
		});
	}
	render()
	{
		let scopeProxy
			= this;
		let jsonReady
			= true;
		let profileReady
			= true;
		let itemCount
			= 0;
		//
		if(scopeProxy.state !== null
		&& _.has(scopeProxy, "state.Results.Filtered") === true
		&& scopeProxy.state.Results.Filtered !== null)
		{
			var filteredList =
				scopeProxy.state.Results.Filtered.map((resultItem)=>
				{
					let populationIndex
						= scopeProxy.state.Results.Indexes[itemCount].Index;
					let resultId
						= "filtered-item_".concat(itemCount, "_", populationIndex);
					let listitemId
						= "list-item_".concat(itemCount);
					let populationItem
						= scopeProxy.state.Population.Original[populationIndex];
					let totalMatchingEntries
						= scopeProxy.countMatchingItems(resultItem);
					let joinString
						= (parseInt(totalMatchingEntries) === 1)
						? " match for "
						: " matches for ";
					let resultitemMessage
						= "We found ".concat(totalMatchingEntries, joinString, resultItem, " nearby.");
					let resultElement =
						<div id={resultId}  onClick={scopeProxy.itemClicked.bind(this, populationItem)} className="result-item">
							<div id={listitemId} className="resultitem-label">{resultItem}</div>
							<div className="resultitem-message">{resultitemMessage}</div>
						</div>
					//
					itemCount++;
					//
					return resultElement;
				});
			//
		}
		else
		{
			var filteredList
				= null;
		}
		if(jsonReady === true
		&& profileReady === true)
		{
			return(
				<div id="listdemo-panelhost-container" className="listdemo-panelhost">
					<div id="listdemo-searchform-container" className="listdemo-searchform">
						<div id="searchform-message-container" className="searchform-message">
							Search for a physician or organization
						</div>
						<div id="searchform-inputfield-container" className="searchform-inputfield">
							<input id="searchform-input-field" type="text" placeholder="enter name of physician or organization" className="form-control" onChange={scopeProxy.filterList.bind(this)}/>
						</div>
						<div id="searchform-results-container" className="searchform-results">
							<div>{filteredList}</div>
						</div>
					</div>
				</div>
			);
		}
		else
		{
			return(
				<div id="listdemo-landing-container" ref="listdemolanding" className="listdemo-landing">
					"Loading Listdemo Content..."
				</div>
			);
		}
	}
	//*************************
	//*************************
	// Specialized Methods
	//
	setListeners()
	{
		let scopeProxy
			= this;
	}
	countMatchingItems(itemSample)
	{
		let scopeProxy
			= this;
		let fullList
			= scopeProxy.state.Population.Searchable;
		let totalItems
			= fullList.length;
		let matchCount
			= 0;
		//
		for(let itemIndex = 0; itemIndex < totalItems; itemIndex++)
		{
			matchCount
			= (itemSample.toLowerCase() === fullList[itemIndex].toLowerCase())
			? matchCount + 1
			: matchCount;
		}
		return matchCount;
	}
	itemClicked(providerParcel)
	{
		console.log("----- List item selected:", providerParcel);

		//this.props.fetchProviderProfile(providerParcel);
	}
	establishSearchableList()
	{
		let scopeProxy
			= this;
		let listPopulation
			= this.state.Population.Original;
		let totalItems
			= listPopulation.length;
		let searchableItems
			= [];
		//
		for(var itemIndex = 0; itemIndex < totalItems; itemIndex++)
		{
			let listItem
				= listPopulation[itemIndex];
			//
			if(_.has(listItem, "first_name") === true)
			{
				let lastName
					= (listItem.last_name !== null
					&& listItem.last_name !== undefined)
					? listItem.last_name
					: "";
				let searchItem
					= listItem.first_name.concat(" ", lastName);
				//
				searchableItems.push(searchItem);
			}
			if(_.has(listItem, "organization_name") === true)
			{
				let searchItem
					= listItem.organization_name;
				//
				searchableItems.push(searchItem);
			}
		}
		updateState(scopeProxy,
		{
			"Population":
			{
				"Original":scopeProxy.props.listdemoPopulationJson,
				"Searchable":searchableItems
			},
			"Results":
			{
				"Size":null,
				"Indexes":null,
				"Filtered":null
			}
		});
	}
	filterList(event)
	{
		let scopeProxy
			= this;
		let updatedList
			= this.state.Population.Searchable;
		let targetValue
			= event.target.value.toLowerCase();
		let indexCollection
			= [];
		let itemCount
			= 0;
		//
		let filteredList =
			updatedList.filter((item)=>
			{
				if(item.toLowerCase().search(targetValue.toLowerCase()) === 0)
				{
					var itemResult
						= true;
					//
					indexCollection.push(
					{
						"Index":itemCount
					});
				}
				else
				{
					var itemResult
						= false;
				}
				itemCount++;
				//
			    return itemResult;
			});
		//
		scopeProxy.setState(
		{
			"Population":
			{
				"Original":scopeProxy.props.listdemoPopulationJson,
				"Searchable":scopeProxy.state.Population.Searchable
			},
			"Results":
			{
				"Size":itemCount,
				"Indexes":indexCollection,
				"Filtered":filteredList
			}
		});
	}
	//*************************
	//*************************
	// Assignments
	//
	static contextTypes =
		{
			"transitionBody":PropTypes.func,
			"updateNavigationState":PropTypes.func,
			"setViewLoaded":PropTypes.func,
			"setLayoutMode":PropTypes.func
		}
	//
}
function mapAxiosstateToReactprops(axiosState)
{
	// This function is only called when the axios
	// response updates the application state. Once
	// this function is called, the component state
	// is updated which causes the render() function
	// to execute.
	return(
	{
		// When the application state (state.posts.all) is
		// updated by the axios promise, the promise response
		// is assigned the component state this.content.posts.
		"listdemoPopulationJson":axiosState.content.listdemoPopulationJson
	});
}
export default connect(mapAxiosstateToReactprops,
{
	"fetchListdemoPopulationJson":fetchListdemoPopulationJson
})(ListdemoLanding);