import type { OptionsObject, SnackbarMessage, SnackbarOrigin } from 'notistack'
import { enqueueSnackbar } from 'notistack'

const autoHideDuration = 6000

const anchorOrigin: SnackbarOrigin = {
    vertical: 'top',
    horizontal: 'center',
}

const notificationAnchorOrigin: SnackbarOrigin = {
    vertical: 'top',
    horizontal: 'right',
}

const Toast = {
    success(msg: SnackbarMessage, option?: OptionsObject) {
        this.toast(msg, {
            variant: 'success',
            anchorOrigin,
            autoHideDuration,
            ...option,
        })
    },
    notification(msg: SnackbarMessage, option?: OptionsObject) {
        this.toast(msg, {
            variant: 'success',
            anchorOrigin: notificationAnchorOrigin,
            autoHideDuration,
            persist: true,
            ...option,
        })
    },
    warning(msg: SnackbarMessage, option?: OptionsObject) {
        this.toast(msg, {
            variant: 'warning',
            anchorOrigin,
            ...option,
        })
    },
    info(msg: SnackbarMessage, option?: OptionsObject) {
        this.toast(msg, {
            variant: 'info',
            anchorOrigin,
            autoHideDuration,
            ...option,
        })
    },
    error(msg: SnackbarMessage, option?: OptionsObject) {
        this.toast(msg, {
            variant: 'error',
            anchorOrigin,
            autoHideDuration,
            ...option,
        })
    },
    toast(msg: SnackbarMessage, option?: OptionsObject) {
        enqueueSnackbar(msg, option)
    },
}

export default Toast
