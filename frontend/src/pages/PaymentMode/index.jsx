import CrudModule from '@/modules/CrudModule/CrudModule';
import PaymentModeForm from '@/forms/PaymentModeForm';
import useLanguage from '@/locale/useLanguage';

export default function PaymentMode() {
  const translate = useLanguage();
  const entity = 'paymentMode';
  const deleteModalLabels = ['name'];
  const dataTableColumns = [
    {
      title: translate('Payment Mode'),
      dataIndex: 'name',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
    },
    {
      title: translate('Default'),
      dataIndex: 'isDefault',
      render: (value) => (value ? translate('Yes') : translate('No')),
    },
  ];

  const config = {
    entity,
    PANEL_TITLE: translate('Payment Mode'),
    DATATABLE_TITLE: translate('Payment Mode'),
    ADD_NEW_ENTITY: translate('Add Payment Mode'),
    ENTITY_NAME: translate('Payment Mode'),
    dataTableColumns,
    searchConfig: {
      displayLabels: ['name'],
      searchFields: 'name',
    },
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<PaymentModeForm />}
      updateForm={<PaymentModeForm isUpdateForm />}
      config={config}
    />
  );
}
