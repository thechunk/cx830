import React, {Component} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import {GlobalStyles} from '../layout/GlobalStyles';
import {Api} from '../data/Api';

export default class LeadsList extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  onAcceptLead(id, userId) {
    return () => {
      Api.sfdcUpdateLead(id, 'Working - Contacted', userId)
        .then(() => {
          this.props.fetchDataFn();
        })
        .catch(console.log);
    }
  }

  navigateDetail(item) {
    return () => {
      this.props.navigation.navigate(
        'Lead',
        {
          id: item.Id,
          title: `${item.Company}`,
        }
      );
    }
  }

  onPressItem(item) {
    return () => {
      Api.getSfdcCredentials().then((credentials) => {
        const isOpenItem = item.Status === 'Open - Not Contacted';
        if (isOpenItem) {
          Alert.alert(
            'Accept Lead',
            'Are you sure you want to accept this lead?',
            [
              { 'text': 'Cancel', style: 'cancel' },
              { 'text': 'Accept', onPress: this.onAcceptLead.bind(this)(item.Id, credentials.userId) }
            ]
          )
        } else {
          this.navigateDetail(item)();
        }
      });
    }
  }

  render() {
    return (
      <FlatList
        data={this.props.data}
        renderItem={({item}) => (
          <TouchableWithoutFeedback onPress={this.onPressItem.bind(this)(item)}>
            <View style={GlobalStyles.flatListSummaryItem}>
              <Text style={GlobalStyles.flatListTitle}>{item.FirstName} {item.LastName} - {item.Company}</Text>
              <Text style={GlobalStyles.flatListDescription}>{item.Address.street}, {item.Address.city} {item.Address.country}</Text>
            </View>
          </TouchableWithoutFeedback>
        )}
        keyExtractor={(item, index) => 'key_' + index}
      />
    );
  }
}
