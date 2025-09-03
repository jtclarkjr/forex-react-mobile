import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    width: 96, // 80 + 16 (right margin)
    paddingRight: 16
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  }
})
