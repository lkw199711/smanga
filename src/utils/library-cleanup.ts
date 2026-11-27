import { h, ref } from 'vue';
import { ElCheckbox, ElMessageBox } from 'element-plus';
import i18n from '@/i18n';

export async function confirmLibraryPurge(allowSourceDelete: boolean): Promise<boolean | null> {
  const { t } = i18n.global;
  const deleteFile = ref(false);
  try {
    await ElMessageBox.confirm(
      () => h('div', [
        h('p', t('libraryCleanup.purgeConfirm')),
        ...(allowSourceDelete ? [h(ElCheckbox, {
          modelValue: deleteFile.value,
          'onUpdate:modelValue': (value) => { deleteFile.value = value === true; },
        }, () => t('libraryCleanup.deleteSources'))] : []),
      ]),
      t('libraryCleanup.purge'),
      { type: 'warning', confirmButtonText: t('libraryCleanup.purge') }
    );
    return deleteFile.value;
  } catch {
    return null;
  }
}
