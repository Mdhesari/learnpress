// Include;
import AdminTools from './pages/tools';
import Statistic from './pages/statistic';
import SyncData from './pages/sync-data';

const $ = jQuery;
const $doc = $( document );
const $win = $( window );

const makePaymentsSortable = function makePaymentsSortable() {
	// Make payments sortable
	$( '.learn-press-payments.sortable tbody' ).sortable( {
		handle: '.dashicons-menu',
		helper( e, ui ) {
			ui.children().each( function() {
				$( this ).width( $( this ).width() );
			} );
			return ui;
		},
		axis: 'y',
		start( event, ui ) {

		},
		stop( event, ui ) {

		},
		update( event, ui ) {
			const order = $( this ).children().map( function() {
				return $( this ).find( 'input[name="payment-order"]' ).val();
			} ).get();

			$.post( {
				url: '',
				data: {
					'lp-ajax': 'update-payment-order',
					order,
				},
				success( response ) {
				},
			} );
		},
	} );
};

const lpMetaboxCustomFields = () => {
	$( '.lp-metabox__custom-fields' ).on( 'click', '.lp-metabox-custom-field-button', function() {
		const row = $( this ).data( 'row' ).replace( /lp_metabox_custom_fields_key/gi, Math.floor( Math.random() * 1000 ) + 1 );

		$( this ).closest( 'table' ).find( 'tbody' ).append( row );
		updateSort( $( this ).closest( '.lp-metabox__custom-fields' ) );
		return false;
	} );

	$( '.lp-metabox__custom-fields' ).on( 'click', 'a.delete', function() {
		$( this ).closest( 'tr' ).remove();
		updateSort( $( this ).closest( '.lp-metabox__custom-fields' ) );
		return false;
	} );

	$( '.lp-metabox__custom-fields tbody' ).sortable( {
		items: 'tr',
		cursor: 'move',
		axis: 'y',
		handle: 'td.sort',
		scrollSensitivity: 40,
		forcePlaceholderSize: true,
		helper: 'clone',
		opacity: 0.65,
		update( event, ui ) {
			updateSort( $( this ).closest( '.lp-metabox__custom-fields' ) );
		},
	} );

	const updateSort = ( element ) => {
		const items = element.find( 'tbody tr' );

		items.each( function( i, item ) {
			$( this ).find( '.sort .count' ).val( i );
		} );
	};
};

const lpMetaboxColorPicker = () => {
	$( '.lp-metabox__colorpick' )
		.iris( {
			change( event, ui ) {
				$( this ).parent().find( '.colorpickpreview' ).css( { backgroundColor: ui.color.toString() } );
			},
			hide: true,
			border: true,
		} )

		.on( 'click focus', function( event ) {
			event.stopPropagation();
			$( '.iris-picker' ).hide();
			$( this ).closest( 'td' ).find( '.iris-picker' ).show();
			$( this ).data( 'original-value', $( this ).val() );
		} )

		.on( 'change', function() {
			if ( $( this ).is( '.iris-error' ) ) {
				const originalValue = $( this ).data( 'original-value' );

				if ( originalValue.match( /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/ ) ) {
					$( this ).val( $( this ).data( 'original-value' ) ).trigger( 'change' );
				} else {
					$( this ).val( '' ).trigger( 'change' );
				}
			}
		} );

	$( 'body' ).on( 'click', function() {
		$( '.iris-picker' ).hide();
	} );
};

const lpMetaboxImage = () => {
	$( '.lp-metabox-field__image' ).each( ( i, ele ) => {
		let lpImageFrame;

		const addImage = $( ele ).find( '.lp-metabox-field__image--add' );
		const delImage = $( ele ).find( '.lp-metabox-field__image--delete' );

		const image = $( ele ).find( '.lp-metabox-field__image--image' );
		const inputVal = $( ele ).find( '.lp-metabox-field__image--id' );

		if ( ! inputVal.val() ) {
			addImage.show();
			delImage.hide();
		} else {
			addImage.hide();
			delImage.show();
		}

		addImage.on( 'click', ( event ) => {
			event.preventDefault();

			if ( lpImageFrame ) {
				lpImageFrame.open();
				return;
			}

			lpImageFrame = wp.media( {
				title: addImage.data( 'choose' ),
				button: {
					text: addImage.data( 'update' ),
				},
				multiple: false,
			} );

			lpImageFrame.on( 'select', function() {
				const attachment = lpImageFrame.state().get( 'selection' ).first().toJSON();
				const attachmentImage = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;

				image.append( '<div class="lp-metabox-field__image--inner"><img src="' + attachmentImage + '" alt="" style="max-width:100%;"/></div>' );

				inputVal.val( attachment.id );

				addImage.hide();

				delImage.show();
			} );

			lpImageFrame.open();
		} );

		delImage.on( 'click', ( event ) => {
			event.preventDefault();

			image.html( '' );

			addImage.show();

			delImage.hide();

			inputVal.val( '' );
		} );
	} );
};

const lpMetaboxImageAdvanced = () => {
	$( '.lp-metabox-field__image-advanced' ).each( ( i, element ) => {
		let lpImageFrame;

		const imageGalleryIds = $( element ).find( '#lp-gallery-images-ids' );
		const listImages = $( element ).find( '.lp-metabox-field__image-advanced-images' );
		const btnUpload = $( element ).find( '.lp-metabox-field__image-advanced-upload > a' );

		$( btnUpload ).on( 'click', ( event ) => {
			event.preventDefault();

			if ( lpImageFrame ) {
				lpImageFrame.open();
				return;
			}

			lpImageFrame = wp.media( {
				title: btnUpload.data( 'choose' ),
				button: {
					text: btnUpload.data( 'update' ),
				},
				states: [
					new wp.media.controller.Library( {
						title: btnUpload.data( 'choose' ),
						filterable: 'all',
						multiple: true,
					} ),
				],
			} );

			lpImageFrame.on( 'select', function() {
				const selection = lpImageFrame.state().get( 'selection' );
				let attachmentIds = imageGalleryIds.val();

				selection.forEach( function( attachment ) {
					attachment = attachment.toJSON();

					if ( attachment.id ) {
						attachmentIds = attachmentIds ? attachmentIds + ',' + attachment.id : attachment.id;
						const attachmentImage = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;

						listImages.append(
							'<li class="image" data-attachment_id="' + attachment.id + '"><img src="' + attachmentImage +
						'" /><ul class="actions"><li><a href="#" class="delete" title="' + btnUpload.data( 'delete' ) + '">' +
						btnUpload.data( 'text' ) + '</a></li></ul></li>'
						);
					}
				} );

				imageGalleryIds.val( attachmentIds );
			} );

			lpImageFrame.open();
		} );

		listImages.sortable( {
			items: 'li.image',
			cursor: 'move',
			scrollSensitivity: 40,
			forcePlaceholderSize: true,
			forceHelperSize: false,
			helper: 'clone',
			opacity: 0.65,
			placeholder: 'lp-metabox-sortable-placeholder',
			start( event, ui ) {
				ui.item.css( 'background-color', '#f6f6f6' );
			},
			stop( event, ui ) {
				ui.item.removeAttr( 'style' );
			},
			update() {
				let attachmentIds = '';

				listImages.find( 'li.image' ).css( 'cursor', 'default' ).each( function() {
					const attachmentId = $( this ).attr( 'data-attachment_id' );
					attachmentIds = attachmentIds + attachmentId + ',';
				} );

				imageGalleryIds.val( attachmentIds );
			},
		} );

		$( listImages ).find( 'li.image' ).each( ( i, ele ) => {
			const del = $( ele ).find( 'a.delete' );

			del.on( 'click', () => {
				$( ele ).remove();

				let attachmentIds = '';

				$( listImages ).find( 'li.image' ).css( 'cursor', 'default' ).each( function() {
					const attachmentId = $( this ).attr( 'data-attachment_id' );
					attachmentIds = attachmentIds + attachmentId + ',';
				} );

				imageGalleryIds.val( attachmentIds );

				return false;
			} );
		} );
	} );
};

const initTooltips = function initTooltips() {
	$( '.learn-press-tooltip' ).each( function() {
		const $el = $( this ),
			args = $.extend( { title: 'data-tooltip', offset: 10, gravity: 's' }, $el.data() );
		$el.tipsy( args );
	} );
};

const initSelect2 = function initSelect2() {
	if ( $.fn.select2 ) {
		$( 'select.lp-select-2' ).select2();
	}
};

const initSingleCoursePermalink = function initSingleCoursePermalink() {
	$doc
		.on( 'change', '.learn-press-single-course-permalink input[type="radio"]', function() {
			const $check = $( this ),
				$row = $check.closest( '.learn-press-single-course-permalink' );
			if ( $row.hasClass( 'custom-base' ) ) {
				$row.find( 'input[type="text"]' ).prop( 'readonly', false );
			} else {
				$row.siblings( '.custom-base' ).find( 'input[type="text"]' ).prop( 'readonly', true );
			}
		} )
		.on( 'change', 'input.learn-press-course-base', function() {
			$( '#course_permalink_structure' ).val( $( this ).val() );
		} )
		.on( 'focus', '#course_permalink_structure', function() {
			$( '#learn_press_custom_permalink' ).click();
		} )
		.on( 'change', '#learn_press_courses_page_id', function() {
			$( 'tr.learn-press-courses-page-id' ).toggleClass( 'hide-if-js', ! parseInt( this.value ) );
		} );
};

const togglePaymentStatus = function togglePaymentStatus( e ) {
	e.preventDefault();
	const $row = $( this ).closest( 'tr' ),
		$button = $( this ),
		status = $row.find( '.status' ).hasClass( 'enabled' ) ? 'no' : 'yes';

	$.ajax( {
		url: '',
		data: {
			'lp-ajax': 'update-payment-status',
			status,
			id: $row.data( 'payment' ),
		},
		success( response ) {
			response = LP.parseJSON( response );
			for ( const i in response ) {
				$( '#payment-' + i + ' .status' ).toggleClass( 'enabled', response[ i ] );
			}
		},
	} );
};

const updateEmailStatus = function updateEmailStatus() {
	( function() {
		$.post( {
			url: window.location.href,
			data: {
				'lp-ajax': 'update_email_status',
				status: $( this ).parent().hasClass( 'enabled' ) ? 'no' : 'yes',
				id: $( this ).data( 'id' ),
			},
			dataType: 'text',
			success: $.proxy( function( res ) {
				res = LP.parseJSON( res );
				for ( const i in res ) {
					$( '#email-' + i + ' .status' ).toggleClass( 'enabled', res[ i ] );
				}
			}, this ),
		} );
	} ).apply( this );
};

const toggleSalePriceSchedule = function toggleSalePriceSchedule() {
	const $el = $( this ),
		id = $el.attr( 'id' );

	if ( id === '_lp_sale_price_schedule' ) {
		$( this ).hide();
		$( '#field-_lp_sale_start, #field-_lp_sale_end' ).removeClass( 'hide-if-js' );
		$win.trigger( 'resize.calculate-tab' );
	} else {
		$( '#_lp_sale_price_schedule' ).show();
		$( '#field-_lp_sale_start, #field-_lp_sale_end' ).addClass( 'hide-if-js' ).find( '#_lp_sale_start, #_lp_sale_end' ).val( '' );
		$win.trigger( 'resize.calculate-tab' );
	}

	return false;
};

const callbackFilterTemplates = function callbackFilterTemplates() {
	const $link = $( this );

	if ( $link.hasClass( 'current' ) ) {
		return false;
	}

	const $templatesList = $( '#learn-press-template-files' ),
		$templates = $templatesList.find( 'tr[data-template]' ),
		template = $link.data( 'template' ),
		filter = $link.data( 'filter' );

	$link.addClass( 'current' ).siblings( 'a' ).removeClass( 'current' );

	if ( ! template ) {
		if ( ! filter ) {
			$templates.removeClass( 'hide-if-js' );
		} else {
			$templates.map( function() {
				$( this ).toggleClass( 'hide-if-js', $( this ).data( 'filter-' + filter ) !== 'yes' );
			} );
		}
	} else {
		$templates.map( function() {
			$( this ).toggleClass( 'hide-if-js', $( this ).data( 'template' ) !== template );
		} );
	}

	$( '#learn-press-no-templates' ).toggleClass( 'hide-if-js', !! $templatesList.find( 'tr.template-row:not(.hide-if-js):first' ).length );

	return false;
};

const toggleEmails = function toggleEmails( e ) {
	e.preventDefault();
	const $button = $( this ),
		status = $button.data( 'status' );

	$.ajax( {
		url: '',
		data: {
			'lp-ajax': 'update_email_status',
			status,
		},
		success( response ) {
			response = LP.parseJSON( response );
			for ( const i in response ) {
				$( '#email-' + i + ' .status' ).toggleClass( 'enabled', response[ i ] );
			}
		},
	} );
};

const duplicatePost = function duplicatePost( e ) {
	e.preventDefault();

	const _self = $( this ),
		_id = _self.data( 'post-id' );

	$.ajax( {
		url: '',
		data: {
			'lp-ajax': 'duplicator',
			id: _id,
		},
		success( response ) {
			response = LP.parseJSON( response );

			if ( response.success ) {
				window.location.href = response.data;
			} else {
				alert( response.data );
			}
		},
	} );
};

const importCourses = function importCourses() {
	const $container = $( '#learn-press-install-sample-data-notice' ),
		action = $( this ).attr( 'data-action' );
	if ( ! action ) {
		return;
	}
	e.preventDefault();

	if ( action === 'yes' ) {
		$container
			.find( '.install-sample-data-notice' ).slideUp()
			.siblings( '.install-sample-data-loading' ).slideDown();
	} else {
		$container.fadeOut();
	}
	$.ajax( {
		url: ajaxurl,
		dataType: 'html',
		type: 'post',
		data: {
			action: 'learnpress_install_sample_data',
			yes: action,
		},
		success( response ) {
			response = LP.parseJSON( response );
			if ( response.url ) {
				$.ajax( {
					url: response.url,
					success() {
						$container
							.find( '.install-sample-data-notice' ).html( response.message ).slideDown()
							.siblings( '.install-sample-data-loading' ).slideUp();
					},
				} );
			} else {
				$container
					.find( '.install-sample-data-notice' ).html( response.message ).slideDown()
					.siblings( '.install-sample-data-loading' ).slideUp();
			}
		},
	} );
};

const onChangeCoursePrices = function onChangeCoursePrices( e ) {
	const _self = $( this ),
		_price = $( '#_lp_price' ),
		_sale_price = $( '#_lp_sale_price' ),
		_target = $( e.target ).attr( 'id' );
	_self.find( '#field-_lp_price div, #field-_lp_sale_price div' ).remove( '.learn-press-tip-floating' );
	if ( parseInt( _sale_price.val() ) >= parseInt( _price.val() ) ) {
		if ( _target === '_lp_price' ) {
			_price.parent( '.rwmb-input' ).append( '<div class="learn-press-tip-floating">' + lpAdminCourseEditorSettings.i18n.notice_price + '</div>' );
		} else if ( _target === '_lp_sale_price' ) {
			_sale_price.parent( '.rwmb-input' ).append( '<div class="learn-press-tip-floating">' + lpAdminCourseEditorSettings.i18n.notice_sale_price + '</div>' );
		}
	}
};

const onChangeSaleStartDate = function onChangeSaleStartDate( e ) {
	const _sale_start_date = $( this ),
		_sale_end_date = $( '#_lp_sale_end' ),
		_start_date = Date.parse( _sale_start_date.val() ),
		_end_date = Date.parse( _sale_end_date.val() ),
		_parent_start = _sale_start_date.parent( '.rwmb-input' ),
		_parent_end = _sale_end_date.parent( '.rwmb-input' );

	if ( ! _start_date ) {
		_parent_start.append( '<div class="learn-press-tip-floating">' + lpAdminCourseEditorSettings.i18n.notice_invalid_date + '</div>' );
	}

	$( '#field-_lp_sale_start div, #field-_lp_sale_end div' ).remove( '.learn-press-tip-floating' );

	if ( _start_date > _end_date ) {
		_parent_start.append( '<div class="learn-press-tip-floating">' + lpAdminCourseEditorSettings.i18n.notice_sale_start_date + '</div>' );
	}
};

const onChangeSaleEndDate = function onChangeSaleEndDate( e ) {
	const _sale_end_date = $( this ),
		_sale_start_date = $( '#_lp_sale_start' ),
		_start_date = Date.parse( _sale_start_date.val() ),
		_end_date = Date.parse( _sale_end_date.val() ),
		_parent_start = _sale_start_date.parent( '.rwmb-input' ),
		_parent_end = _sale_end_date.parent( '.rwmb-input' );

	if ( ! _end_date ) {
		_parent_end.append( '<div class="learn-press-tip-floating">' + lpAdminCourseEditorSettings.i18n.notice_invalid_date + '</div>' );
	}

	$( '#field-_lp_sale_start div, #field-_lp_sale_end div' ).remove( '.learn-press-tip-floating' );
	if ( _start_date > _end_date ) {
		_parent_end.append( '<div class="learn-press-tip-floating">' + lpAdminCourseEditorSettings.i18n.notice_sale_end_date + '</div>' );
	}
};

const onReady = function onReady() {
	makePaymentsSortable();
	initSelect2();
	initTooltips();
	initSingleCoursePermalink();

	// lp Metabox in LP4.
	lpMetaboxCustomFields();
	lpMetaboxColorPicker();
	lpMetaboxImageAdvanced();
	lpMetaboxImage();

	$( '.learn-press-tabs' ).LP( 'AdminTab' );

	$( document )
		.on( 'click', '.learn-press-payments .status .dashicons', togglePaymentStatus )
		.on( 'click', '.change-email-status', updateEmailStatus )
		.on( 'click', '#_lp_sale_price_schedule', toggleSalePriceSchedule )
		.on( 'click', '#_lp_sale_price_schedule_cancel', toggleSalePriceSchedule )
		.on( 'click', '.learn-press-filter-template', callbackFilterTemplates )
		.on( 'click', '#learn-press-enable-emails, #learn-press-disable-emails', toggleEmails )
		.on( 'click', '.lp-duplicate-row-action .lp-duplicate-post', duplicatePost )
		.on( 'click', '#learn-press-install-sample-data-notice a', importCourses )
		.on( 'input', '#meta-box-tab-course_payment', onChangeCoursePrices )
		.on( 'change', '#_lp_sale_start', onChangeSaleStartDate )
		.on( 'change', '#_lp_sale_end', onChangeSaleEndDate );
};

$( document ).ready( onReady );

